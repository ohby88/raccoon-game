// toss-api.js - Toss Miniapp Mock SDK
window.TossAPI = {
  init: function() {
    console.log("[TossAPI] Initialized successfully.");
    return Promise.resolve(true);
  },
  
  getUserInfo: function() {
    return Promise.resolve({
      id: "user_mock_12345",
      name: "김토스",
      profileImage: ""
    });
  },

  showRewardAd: function(onCompleted) {
    console.log("[TossAPI] Showing mock reward ad...");
    const overlay = document.createElement('div');
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(4px);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;";
    overlay.innerHTML = `
      <h2 style="margin-bottom:20px; font-weight:800; font-size:24px;">광고 시청 중... 📺</h2>
      <div style="font-size:56px; font-weight:800; color:#3182F6;" id="adTimer">2</div>
      <p style="margin-top:20px; color:#B0B8C1; font-weight:500;">(이 화면은 잠시 후 자동으로 닫힙니다)</p>
    `;
    document.body.appendChild(overlay);

    let count = 2; // short wait for testing
    const interval = setInterval(() => {
      count--;
      const timerEl = document.getElementById('adTimer');
      if(timerEl) timerEl.textContent = count;
      if(count <= 0) {
        clearInterval(interval);
        if (overlay.parentNode) document.body.removeChild(overlay);
        console.log("[TossAPI] Ad completely watched. Rewarding user.");
        if(onCompleted) onCompleted();
      }
    }, 1000);
  },

  pay: function(amount, onCompleted) {
    console.log(`[TossAPI] Processing mock payment for ${amount}원...`);
    setTimeout(() => {
      if(onCompleted) onCompleted(true);
    }, 1000);
  }
};
