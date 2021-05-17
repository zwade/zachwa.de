// We want all off-site links to be target=_blank
window.addEventListener("load", () => {
    const anchors = document.querySelectorAll("a");
    for (let anchor of anchors) {
        const url = new URL(anchor.href)
        if (url.origin === location.origin) {
            continue;
        }
        anchor.target = "_blank";
    }
});