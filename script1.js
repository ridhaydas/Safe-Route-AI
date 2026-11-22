// ==========================
// SafeRoute AI Script
// ==========================

const sosBtn = document.getElementById("sosBtn");
const locationBtn = document.getElementById("locationBtn");
const nearbyBtn = document.getElementById("nearbyBtn");
const voiceBtn = document.getElementById("voiceBtn");

const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const messages = document.getElementById("messages");
const routeBtn = document.getElementById("routeBtn");
const fromLocation = document.getElementById("fromLocation");
const toLocation = document.getElementById("toLocation");
const routeResult = document.getElementById("routeResult");
// Route makers
let startMarker = null;
let endMarker = null;

// ==========================
// Smart SOS Button
// ==========================

sosBtn.addEventListener("click", () => {

    // 🔊 Play emergency siren
    playSiren();

    // 📳 Vibrate device (if supported)
    if (navigator.vibrate) {
        navigator.vibrate([500, 300, 500, 300, 500]);
    }

    // Check if Geolocation is supported
    if (!navigator.geolocation) {
        alert("Geolocation is not supported on this device.");
        return;
    }

    // Get current location
    navigator.geolocation.getCurrentPosition(

        (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

            // WhatsApp emergency message
            const whatsappMessage =
`🚨 EMERGENCY ALERT!

I need immediate help.

📍 My Live Location:
${locationLink}

Please contact me immediately.`;

            // WhatsApp URL
            const whatsappURL =
`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

            // Open Google Maps
            window.open(locationLink, "_blank");

            // Open WhatsApp after 2 seconds
            setTimeout(() => {
                window.open(whatsappURL, "_blank");
            }, 2000);

            const callNow = confirm(
`🚨 SOS ACTIVATED!

📍 Latitude : ${latitude}

📍 Longitude : ${longitude}

🎯 Accuracy : ${Math.round(accuracy)} meters

🗺️ Google Maps opened.

💬 WhatsApp opened.

📞 Do you want to call Emergency Services (112)?`
);

if (callNow) {
    window.location.href = "tel:112";
}

        },

        (error) => {

            console.error(error);

            alert("❌ Unable to get your location.");

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

});

// ==========================
// Live Location
// ==========================

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(

        (position) => {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            alert(
                `Location Shared!\n\nLatitude: ${lat}\nLongitude: ${lng}`
            );

            window.open(
                `https://www.google.com/maps?q=${lat},${lng}`,
                "_blank"
            );

        },

        () => {

            alert("Unable to get location.");

        }

    );

});

// ==========================
// Nearby Help
// ==========================

nearbyBtn.addEventListener("click", () => {

    alert(
        "Opening nearby Police Stations & Hospitals..."
    );

    window.open(
        "https://www.google.com/maps/search/police+station+near+me",
        "_blank"
    );

});

// ==========================
// Voice SOS
// ==========================

voiceBtn.addEventListener("click", () => {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert("Speech Recognition not supported.");

        return;

    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.start();

    alert("Listening... Say 'Help me'");

    recognition.onresult = function(event){

        const speech =
            event.results[0][0].transcript.toLowerCase();

        if(speech.includes("help")){

            alert("🚨 Voice SOS Activated!");

        }
        else{

            alert("You said: " + speech);

        }

    };

});

// ==========================
// Chat UI
// ==========================

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {

    const text = userInput.value.trim();

    if (text === "") return;

    addUserMessage(text);

    userInput.value = "";

    const typing = document.createElement("div");

    typing.className = "typing";
    typing.id = "typing";

    typing.innerHTML = `
<span></span>
<span></span>
<span></span>
`;

    messages.appendChild(typing);

    messages.scrollTop = messages.scrollHeight;

    try {

        const response = await fetch("http://localhost:3000/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: text
            })

        });

        const data = await response.json();

        document.getElementById("typing").remove();

        addBotMessage(data.reply);

    } catch (error) {

        document.getElementById("typing").remove();

        addBotMessage("❌ Unable to connect to SafeRoute AI.");

        console.error(error);

    }

}

// ==========================
// User Message
// ==========================

function addUserMessage(text){

    const div = document.createElement("div");

    div.className = "user-message";

    div.innerHTML = text;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;

}

// ==========================
// Bot Message
// ==========================

function addBotMessage(text){

    const div = document.createElement("div");

    div.className = "bot-message";

    div.innerHTML = text;

    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;

}

// ==========================
// AI Safe Route Advisor
// ==========================

routeBtn.addEventListener("click", async () => {

    const from = fromLocation.value.trim();
    const to = toLocation.value.trim();

    // Get coordinates of both locations
     const start = await getCoordinates(from);
     const end = await getCoordinates(to);

    if (!from || !to) {
        alert("Please enter both locations.");
        return;
    }

    routeResult.style.display = "block";
    document.getElementById("map").style.display = "block";

// Refresh the map after it becomes visible
setTimeout(() => {
    map.invalidateSize();
}, 200);
    routeResult.innerHTML = "🛡️ Analyzing safest route...";

    try {
           
        const response = await fetch("http://localhost:3000/route-advice", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                from,
                to
            })

        });

        const data = await response.json();

        routeResult.innerHTML = data.advice;

    } catch (error) {

        console.error(error);

        routeResult.innerHTML =
            "❌ Unable to analyze route.";

    }

});

// ==========================
// Emergency Siren
// ==========================

function playSiren() {

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sawtooth";

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.value = 0.08;

    oscillator.start();

    let high = false;

    const interval = setInterval(() => {

        oscillator.frequency.setValueAtTime(
            high ? 900 : 600,
            audioContext.currentTime
        );

        high = !high;

    }, 300);

    setTimeout(() => {

        clearInterval(interval);
        oscillator.stop();
        audioContext.close();

    }, 5000);

}

// ==========================
// Leaflet Map
// ==========================

let map = L.map('map').setView([12.9716, 77.5946], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ==========================
// Convert Place to Coordinates
// ==========================

async function getCoordinates(place) {

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`
    );

    const data = await response.json();

    if (data.length === 0) {
        throw new Error("Location not found");
    }

    return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
    };

}
