(function () {
    const metaCode = document.currentScript.getAttribute("data-meta-code");

    if (!metaCode) return;

    const iframe = document.createElement("iframe");
    iframe.src = `https://chat.olyox.com?metaCode=${metaCode}`;
    iframe.style.position = "fixed";
    iframe.style.bottom = "20px";
    iframe.style.right = "20px";
    iframe.style.width = "350px";
    iframe.style.height = "500px";
    iframe.style.border = "none";
    iframe.style.zIndex = "9999";
    iframe.style.borderRadius = "12px";

    document.body.appendChild(iframe);
})();
