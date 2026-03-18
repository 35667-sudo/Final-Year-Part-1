class ChatWidget {
  constructor() {
    this.isOpen = false
    this.isStreaming = false
    this.testMode = false // Start in live mode since we have CORS proxy
    this.currentStreamingId = null
    this.messages = []

    this.initializeElements()
    this.attachEventListeners()
    this.addInitialMessage()
  }

  initializeElements() {
    this.chatButton = document.getElementById("chatButton")
    this.chatPopup = document.getElementById("chatPopup")
    this.chatClose = document.getElementById("chatClose")
    this.chatInput = document.getElementById("chatInput")
    this.chatSend = document.getElementById("chatSend")
    this.chatBody = document.getElementById("chatBody")
    this.chatBadge = document.getElementById("chatBadge")
    this.modeToggle = document.getElementById("modeToggle")
    this.testModeText = document.getElementById("testModeText")
    this.liveModeText = document.getElementById("liveModeText")
  }

  attachEventListeners() {
    this.chatButton.addEventListener("click", () => this.toggleChat())
    this.chatClose.addEventListener("click", () => this.closeChat())
    this.chatSend.addEventListener("click", () => this.sendMessage())
    this.modeToggle.addEventListener("click", () => this.toggleMode())

    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        this.sendMessage()
      }
    })
  }

  addInitialMessage() {
    const initialMessage = {
      id: this.generateId(),
      sender: "bot",
      text: "🌾👋 Hello! I'm your AgriBot assistant! 🤖✨ I'm now using ThingProxy to connect to the API. How can I help you with agricultural disaster management today? 🌱",
    }
    this.messages.push(initialMessage)
  }

  generateId() {
    return "msg-" + Math.random().toString(36).substr(2, 9)
  }

  toggleChat() {
    this.isOpen = !this.isOpen
    if (this.isOpen) {
      this.chatPopup.classList.add("active")
      this.chatBadge.style.display = "none"
      this.chatInput.focus()
    } else {
      this.chatPopup.classList.remove("active")
    }
  }

  closeChat() {
    this.isOpen = false
    this.chatPopup.classList.remove("active")
  }

  toggleMode() {
    this.testMode = !this.testMode

    if (this.testMode) {
      this.testModeText.style.display = "inline"
      this.liveModeText.style.display = "none"
    } else {
      this.testModeText.style.display = "none"
      this.liveModeText.style.display = "inline"
    }

    this.modeToggle.classList.toggle("test-mode", this.testMode)

    // Show mode switch message
    const modeMessage = this.testMode
      ? "🧪 Switched to Test Mode - Using simulated responses"
      : "🔴 Switched to Live Mode - Connecting to API via ThingProxy"
    this.addMessage("bot", modeMessage)
  }

  async sendMessage() {
    if (this.isStreaming) {
      this.stopStreaming()
      return
    }

    const message = this.chatInput.value.trim()
    if (!message) return

    // Add user message
    this.addMessage("user", message)
    this.chatInput.value = ""
    this.setStreaming(true)

    try {
      const streamId = this.generateId()
      this.currentStreamingId = streamId

      if (this.testMode) {
        await this.sendTestMessage(message, streamId)
      } else {
        await this.sendApiMessage(message, streamId)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      this.handleError(error)
    }
  }

  async sendApiMessage(message, streamId) {
    try {
      // Add loading message
      this.addLoadingMessage(streamId)

      const apiUrl = "   http://127.0.0.1:8000/ask/"

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
        body: JSON.stringify({ question: message }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Remove loading message
      this.removeMessage(streamId)

      if (data.answer) {
        await this.streamResponse(data.answer, streamId)
      } else {
        this.addMessage("bot", "🤖 Sorry, I couldn't understand that. Please try again.")
        this.setStreaming(false)
      }
    } catch (error) {
      this.removeMessage(streamId)

      // Provide specific error guidance
      if (error.message.includes("CORS") || error.message.includes("fetch")) {
        this.addMessage(
          "bot",
          `🚫 Connection Error! 
              Would you like me to switch to Test Mode? 🤖`,
        )
      } else {
        this.addMessage(
          "bot",
          `🚫 Error: ${error.message}

Please try again or use Test Mode for now. 🔄`,
        )
      }

      this.setStreaming(false)
    }
  }

  async sendTestMessage(message, streamId) {
    const testResponses = [
      "🌾 Thank you for your question about agricultural disaster management! Based on current weather patterns, I recommend implementing preventive measures for crop protection. 🛡️",
      "💧 For drought management, consider implementing water conservation techniques such as drip irrigation and mulching to retain soil moisture. 🌱",
      "🌊 In case of flooding, ensure proper drainage systems are in place and consider relocating livestock to higher ground. 🐄",
      "🐛 Pest management during disasters requires integrated approaches including biological controls and resistant crop varieties. 🌿",
      "⚠️ Early warning systems are crucial for agricultural disaster preparedness. Monitor weather forecasts and soil conditions regularly. 📊",
      "🌡️ Temperature fluctuations can stress crops. Consider using protective covers and adjusting irrigation schedules accordingly. 🏠",
      "🌪️ For storm preparation, secure equipment, harvest ready crops early, and ensure livestock have adequate shelter. 🚜",
      "🌱 Soil health is crucial during disasters. Implement cover cropping and organic matter addition to improve resilience. 🌿",
      "📱 Use mobile apps and IoT sensors for real-time monitoring of crop conditions and environmental factors. 📊",
      "🚁 Consider drone technology for aerial surveillance of large agricultural areas during disaster events. 🛸",
    ]

    const randomResponse = testResponses[Math.floor(Math.random() * testResponses.length)]
    await this.streamResponse(randomResponse, streamId)
  }

  async streamResponse(answer, messageId) {
    const cleanAnswer = this.removeThinkTags(answer)

    // Add empty message for streaming
    this.addMessage("bot", "", messageId, true)

    // Stream character by character
    for (let i = 0; i <= cleanAnswer.length; i++) {
      if (this.currentStreamingId !== messageId) break

      this.updateMessage(messageId, cleanAnswer.substring(0, i))
      await this.delay(30)
    }

    // Mark streaming as complete
    this.completeStreaming(messageId)
    this.setStreaming(false)
    this.currentStreamingId = null
  }

  addMessage(sender, text, id = null, isStreaming = false) {
    const messageId = id || this.generateId()
    const message = { id: messageId, sender, text, isStreaming }
    this.messages.push(message)
    this.renderMessage(message)
    this.scrollToBottom()
    return messageId
  }

  addLoadingMessage(id) {
    const messageElement = document.createElement("div")
    messageElement.className = "message bot"
    messageElement.id = `msg-${id}`
    messageElement.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="spinner"></div>
                    <span class="typing-text">🤖 Connecting ...</span>
                </div>
            </div>
        `
    this.chatBody.appendChild(messageElement)
    this.scrollToBottom()
  }

  renderMessage(message) {
    const messageElement = document.createElement("div")
    messageElement.className = `message ${message.sender}`
    messageElement.id = `msg-${message.id}`

    const content = document.createElement("div")
    content.className = "message-content"

    const text = document.createElement("p")
    text.textContent = message.text
    content.appendChild(text)

    if (message.isStreaming) {
      const typingIndicator = document.createElement("div")
      typingIndicator.className = "typing-indicator"
      typingIndicator.innerHTML = `
                <div class="spinner"></div>
                <span class="typing-text">🤖 Typing...</span>
            `
      content.appendChild(typingIndicator)
    }

    messageElement.appendChild(content)
    this.chatBody.appendChild(messageElement)
  }

  updateMessage(messageId, text) {
    const messageElement = document.getElementById(`msg-${messageId}`)
    if (messageElement) {
      const textElement = messageElement.querySelector("p")
      if (textElement) {
        textElement.textContent = text
      }
    }
  }

  completeStreaming(messageId) {
    const messageElement = document.getElementById(`msg-${messageId}`)
    if (messageElement) {
      const typingIndicator = messageElement.querySelector(".typing-indicator")
      if (typingIndicator) {
        typingIndicator.remove()
      }
    }
  }

  removeMessage(messageId) {
    const messageElement = document.getElementById(`msg-${messageId}`)
    if (messageElement) {
      messageElement.remove()
    }
    this.messages = this.messages.filter((msg) => msg.id !== messageId)
  }

  setStreaming(streaming) {
    this.isStreaming = streaming
    this.chatInput.disabled = streaming
    this.chatSend.classList.toggle("stop-mode", streaming)

    const icon = this.chatSend.querySelector("i")
    if (streaming) {
      icon.className = "fa-solid fa-square"
    } else {
      icon.className = "fa-solid fa-paper-plane"
    }
  }

  stopStreaming() {
    this.isStreaming = false
    this.currentStreamingId = null
    this.setStreaming(false)

    // Remove any streaming messages
    const streamingMessages = this.messages.filter((msg) => msg.isStreaming)
    streamingMessages.forEach((msg) => this.removeMessage(msg.id))
  }

  handleError(error) {
    let errorMessage = "🚫 I'm having trouble connecting to the server. "

    if (error instanceof TypeError && error.message.includes("fetch")) {
      errorMessage +=
        "ThingProxy might be experiencing issues. Please try Test Mode or wait a moment and retry. 🔧"
    } else if (error instanceof Error) {
      errorMessage += `Error: ${error.message} 📋`
    } else {
      errorMessage += "Please try again later or use Test Mode. 🔄"
    }

    this.addMessage("bot", errorMessage)
    this.setStreaming(false)
    this.currentStreamingId = null
  }

  removeThinkTags(answer) {
    return answer.replace(/<\/?think>/g, "").trim()
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  scrollToBottom() {
    this.chatBody.scrollTop = this.chatBody.scrollHeight
  }
}

// Initialize the chat widget when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new ChatWidget()
})
