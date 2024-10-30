const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.getElementById("send-message");

const API_KEY = "AIzaSyBMkTJ1LOZc3nPyhJ6VgVeEwYbiEzMtm6U"; // Replace with a valid API key
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const userData = {
  message: null,
};

messageInput.addEventListener("input", () => {
  sendMessageButton.classList.toggle("visible", messageInput.value.trim().length > 0);
});

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userData.message }] }],
    }),
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error.message);
    }

    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
      const apiResponseText = data.candidates[0].content.parts[0].text.trim();
      messageElement.innerText = apiResponseText;

      const botResponseDiv = createMessageElement(
        `<div class="message-text">${apiResponseText}</div>`,
        "bot-message"
      );
      chatBody.appendChild(botResponseDiv);
      scrollToBottom();
    } else {
      showError("I didn't quite understand that. Can you please rephrase?");
    }
  } catch (error) {
    console.error(error);
    showError("Sorry, something went wrong. Please try again.");
  }
};

const showError = (message) => {
  const errorMessage = createMessageElement(
    `<div class="message-text">${message}</div>`,
    "bot-message"
  );
  chatBody.appendChild(errorMessage);
  scrollToBottom();
};

const scrollToBottom = () => {
  chatBody.scrollTop = chatBody.scrollHeight;
};

const handleOutgoingMessage = async (userMessage) => {
  userData.message = userMessage;

  const outgoingMessageDiv = createMessageElement(
    `<div class="message-text">${userData.message}</div>`,
    "user-message"
  );
  chatBody.appendChild(outgoingMessageDiv);
  scrollToBottom();

  const thinkingMessageContent = `
    <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
      <path d="M10 10 H 90 V 90 H 10 Z" /> <!-- Example path -->
    </svg>
    <div class="message-text">
      <div class="thinking-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>`;

  const incomingMessageDiv = createMessageElement(
    thinkingMessageContent,
    "bot-message",
    "thinking"
  );
  chatBody.appendChild(incomingMessageDiv);
  scrollToBottom();

  setTimeout(() => {
    generateBotResponse(incomingMessageDiv);
  }, 600);
};

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && messageInput.value.trim()) {
    e.preventDefault();
    handleOutgoingMessage(messageInput.value.trim());
    messageInput.value = "";
    sendMessageButton.classList.remove("visible");
  }
});

sendMessageButton.addEventListener("click", (e) => {
  e.preventDefault();
  if (messageInput.value.trim()) {
    handleOutgoingMessage(messageInput.value.trim());
    messageInput.value = "";
    sendMessageButton.classList.remove("visible");
  }
});

// Ensure that the following code executes after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const userInputForm = document.getElementById("chat-form");

  if (userInputForm) {
    userInputForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const userMessage = messageInput.value.trim();
      if (userMessage) {
        handleOutgoingMessage(userMessage);
        messageInput.value = "";
      }
    });
  } else {
    console.error("Form not found.");
  }
});