let userPassword = "";
let isThinking = false;
let recognition = null;
let isRecording = false;
let selectedFileToUpload = null;

function handleLoginKey(e) {
    if (e.key === "Enter") {
        unlockApp();
    }
}

function handleChatKey(e) {
    if (e.key === "Enter" && !isThinking) {
        sendMessage();
    }
}

async function unlockApp() {
    const passInput = document.getElementById("pass-input");
    const errorMsg = document.getElementById("error-msg");
    const pass = passInput.value.trim();

    if (!pass) {
        errorMsg.innerText = "कृपया पासवर्ड दर्ज करें!";
        return;
    }

    errorMsg.innerText = "जाँच हो रही है...";

    try {
        const response = await fetch("/api/verify_password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: pass })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            userPassword = pass;
            errorMsg.innerText = "";
            document.getElementById("login-screen").classList.add("hidden");
            document.getElementById("chat-screen").classList.remove("hidden");
            loadKnowledgeStats();
            document.getElementById("user-input").focus();
        } else {
            errorMsg.innerText = data.error || "गलत पासवर्ड! कृपया पुनः प्रयास करें।";
        }
    } catch (err) {
        errorMsg.innerText = "सर्वर से कनेक्ट होने में समस्या आई।";
    }
}

function lockApp() {
    userPassword = "";
    document.getElementById("pass-input").value = "";
    document.getElementById("chat-screen").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
}

async function loadKnowledgeStats() {
    try {
        const response = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: userPassword })
        });
        const data = await response.json();
        if (data.files) {
            document.getElementById("knowledge-stats").innerText = 
                `${data.files.length} फाइलें सक्रिय (${data.total_facts} तथ्य मेमोरी में हैं)`;
        }
    } catch (e) {
        document.getElementById("knowledge-stats").innerText = "लोकल मेमोरी सक्रिय";
    }
}

function sendQuickQuery(text) {
    if (isThinking) return;
    document.getElementById("user-input").value = text;
    sendMessage();
}

// 📁 फाइल अपलोड मोडल और अपलोड लॉजिक
function openUploadModal() {
    document.getElementById("upload-modal").classList.remove("hidden");
    document.getElementById("dropzone-text").innerText = "फ़ाइल चुनने के लिए यहाँ टैप करें";
    document.getElementById("upload-status").innerText = "";
    selectedFileToUpload = null;
    document.getElementById("file-picker").value = "";
}

function closeUploadModal() {
    document.getElementById("upload-modal").classList.add("hidden");
}

function handleFileChosen(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
        selectedFileToUpload = files[0];
        document.getElementById("dropzone-text").innerHTML = `चयनित फ़ाइल: <strong>${escapeHtml(selectedFileToUpload.name)}</strong> (${(selectedFileToUpload.size / 1024).toFixed(1)} KB)`;
        document.getElementById("upload-status").innerText = "";
    }
}

async function uploadSelectedFile() {
    const statusText = document.getElementById("upload-status");

    if (!selectedFileToUpload) {
        statusText.style.color = "#f87171";
        statusText.innerText = "कृपया पहले कोई फाइल चुनें!";
        return;
    }

    statusText.style.color = "#38bdf8";
    statusText.innerText = "फाइल अपलोड और न्यूरल ट्रेनिंग जारी है...";

    const formData = new FormData();
    formData.append("file", selectedFileToUpload);
    formData.append("password", userPassword);

    try {
        const res = await fetch("/api/upload_file", {
            method: "POST",
            body: formData
        });
        const data = await res.json();

        if (res.ok && data.success) {
            statusText.style.color = "#34d399";
            statusText.innerText = data.message;
            loadKnowledgeStats();

            // चैट बॉक्स में सूचना जोड़ें
            const chatBox = document.getElementById("chat-box");
            chatBox.innerHTML += `
                <div class="msg ai-msg">
                    <div class="msg-avatar">📁</div>
                    <div class="msg-body">
                        <div class="msg-content" style="border-left: 3px solid #10b981;">
                            <strong>नई फाइल सीखी:</strong> '${escapeHtml(data.filename)}' का सारा डेटा मेमोरी में शामिल कर लिया गया है। अब आप इससे जुड़े सवाल पूछ सकते हैं!
                        </div>
                    </div>
                </div>
            `;
            chatBox.scrollTop = chatBox.scrollHeight;

            setTimeout(() => {
                closeUploadModal();
            }, 1400);
        } else {
            statusText.style.color = "#f87171";
            statusText.innerText = data.error || "अपलोड विफल!";
        }
    } catch (e) {
        statusText.style.color = "#f87171";
        statusText.innerText = "सर्वर एरर!";
    }
}

// 🎙️ वॉइस इनपुट
function toggleVoiceInput() {
    const micBtn = document.getElementById("mic-btn");

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("माफ़ कीजिए, आपके ब्राउज़र में वॉइस रिकॉग्निशन सपोर्ट नहीं है। Chrome या Edge का उपयोग करें।");
        return;
    }

    if (isRecording) {
        recognition.stop();
        return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;

    recognition.onstart = function() {
        isRecording = true;
        micBtn.classList.add("recording");
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("user-input").value = transcript;
    };

    recognition.onerror = function() {
        isRecording = false;
        micBtn.classList.remove("recording");
    };

    recognition.onend = function() {
        isRecording = false;
        micBtn.classList.remove("recording");
        if (document.getElementById("user-input").value.trim()) {
            sendMessage();
        }
    };

    recognition.start();
}

// 🔊 टेक्स्ट-टू-स्पीच
function speakText(btn, text) {
    if (!('speechSynthesis' in window)) {
        alert("ब्राउज़र में टेक्स्ट-टू-स्पीच सपोर्ट नहीं है।");
        return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 1.0;

    btn.classList.add("speaking");
    utterance.onend = () => btn.classList.remove("speaking");
    utterance.onerror = () => btn.classList.remove("speaking");

    window.speechSynthesis.speak(utterance);
}

// ⚡ न्यूरल एक्टिविटी स्ट्रिप
function animateNeuralStrip() {
    const h1 = document.getElementById("h1-node");
    const h2 = document.getElementById("h2-node");
    const out = document.getElementById("out-node");

    setTimeout(() => h1.classList.add("fired"), 100);
    setTimeout(() => { h1.classList.remove("fired"); h2.classList.add("fired"); }, 250);
    setTimeout(() => { h2.classList.remove("fired"); out.classList.add("fired"); }, 400);
    setTimeout(() => out.classList.remove("fired"), 650);
}

async function sendMessage() {
    if (isThinking) return;
    const input = document.getElementById("user-input");
    const query = input.value.trim();
    if (!query) return;

    isThinking = true;
    animateNeuralStrip();
    const chatBox = document.getElementById("chat-box");

    chatBox.innerHTML += `
        <div class="msg user-msg">
            <div class="msg-avatar">👤</div>
            <div class="msg-body">
                <div class="msg-content">${escapeHtml(query)}</div>
            </div>
        </div>
    `;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    const tempId = "temp-" + Date.now();
    chatBox.innerHTML += `
        <div id="${tempId}" class="msg ai-msg">
            <div class="msg-avatar">🤖</div>
            <div class="msg-body">
                <div class="msg-content"><span class="thinking-text">न्यूरल नेटवर्क विश्लेषण जारी है...</span></div>
            </div>
        </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("/api/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: userPassword, query: query })
        });

        const data = await response.json();
        const tempMsgEl = document.getElementById(tempId);

        if (response.status === 403) {
            tempMsgEl.innerHTML = `
                <div class="msg-avatar">⚠️</div>
                <div class="msg-body">
                    <div class="msg-content" style="color: #f87171;">सत्र समाप्त! कृपया पुनः पासवर्ड से लॉगिन करें।</div>
                </div>
            `;
        } else {
            const bodyDiv = tempMsgEl.querySelector(".msg-body");
            bodyDiv.innerHTML = `
                <div class="msg-content"></div>
                <div class="msg-meta">
                    <span>मैच: ${data.confidence || 0}%</span>
                    <span>•</span>
                    <span>श्रेणी: ${data.category || 'ज्ञान'}</span>
                    <span>•</span>
                    <button class="btn-speak" onclick="speakText(this, '${escapeForSpeech(data.answer)}')">🔊 सुनें</button>
                </div>
            `;

            const contentDiv = bodyDiv.querySelector(".msg-content");
            await typeText(contentDiv, data.answer);
        }
    } catch (err) {
        const tempMsgEl = document.getElementById(tempId);
        tempMsgEl.innerHTML = `
            <div class="msg-avatar">⚠️</div>
            <div class="msg-body">
                <div class="msg-content" style="color: #f87171;">सर्वर से संपर्क नहीं हो पाया।</div>
            </div>
        `;
    } finally {
        isThinking = false;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function typeText(element, text) {
    return new Promise((resolve) => {
        let i = 0;
        const speed = 14;
        function type() {
            if (i < text.length) {
                element.innerText += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

function openVisualizerModal() {
    document.getElementById("visualizer-modal").classList.remove("hidden");
}

function closeVisualizerModal() {
    document.getElementById("visualizer-modal").classList.add("hidden");
}

async function openLibraryModal() {
    document.getElementById("library-modal").classList.remove("hidden");
    const container = document.getElementById("knowledge-items-list");
    container.innerHTML = "मेमोरी से लोड हो रहा है...";

    try {
        const res = await fetch("/api/knowledge_list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: userPassword })
        });
        const data = await res.json();
        if (data.items && data.items.length) {
            container.innerHTML = data.items.map(item => `
                <div class="k-item-card">
                    <span class="k-text">${escapeHtml(item.text)}</span>
                    <span class="k-badge">${item.category}</span>
                </div>
            `).join("");
        } else {
            container.innerHTML = "कोई तथ्य नहीं मिले।";
        }
    } catch (e) {
        container.innerHTML = "लोड करने में त्रुटि आई।";
    }
}

function closeLibraryModal() {
    document.getElementById("library-modal").classList.add("hidden");
}

function openTeachModal() {
    document.getElementById("teach-modal").classList.remove("hidden");
    document.getElementById("teach-input").value = "";
    document.getElementById("teach-status").innerText = "";
    document.getElementById("teach-input").focus();
}

function closeTeachModal() {
    document.getElementById("teach-modal").classList.add("hidden");
}

async function submitNewKnowledge() {
    const input = document.getElementById("teach-input");
    const statusText = document.getElementById("teach-status");
    const fact = input.value.trim();

    if (!fact || fact.length < 5) {
        statusText.style.color = "#f87171";
        statusText.innerText = "कृपया कम से कम एक पूरा वाक्य लिखें!";
        return;
    }

    statusText.style.color = "#38bdf8";
    statusText.innerText = "मेमोरी में लिखा जा रहा है...";

    try {
        const response = await fetch("/api/teach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: userPassword, fact: fact })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            statusText.style.color = "#34d399";
            statusText.innerText = "सफलता! नया ज्ञान मेमोरी में सेव हो गया।";
            loadKnowledgeStats();
            setTimeout(() => {
                closeTeachModal();
            }, 1200);
        } else {
            statusText.style.color = "#f87171";
            statusText.innerText = data.error || "सेव नहीं हो पाया!";
        }
    } catch (e) {
        statusText.style.color = "#f87171";
        statusText.innerText = "सर्वर एरर!";
    }
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}

function escapeForSpeech(text) {
    return text.replace(/['"\\💡]/g, " ").replace(/\s+/g, " ").trim();
}
