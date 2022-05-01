document.addEventListener("readystatechange", function () {
  if (document.readyState == "complete") executeLinkX();
});
function executeLinkX() {
  const anchors = Array.prototype.slice.call(document.querySelectorAll("a"));
  let refinedLinks = [];
  const onThisPage = [];
  const externalLinks = [];
  const decorativeLinks = [];
  const otherLinks = [];
  let spookyLinks = [];
  anchors.forEach((element) => {
    const childNodes = element.childNodes.length;
    const children = element.children.length;
    let firstChild = element.firstChild;
    const pseudoTextTags = ["style", "STYLE", "svg", "SVG", "script", "SCRIPT"]; // tags that do return the textContent but that are not human readable
    let elementHref = element.getAttribute("href");
    let elementTarget = element.getAttribute("target")
      ? element.getAttribute("target") == "_self"
        ? "_parent"
        : element.getAttribute("target")
      : "_parent";
    let elementText = "";
    if (elementHref) {
      for (let i = 0; i < childNodes; i++) {
        if (firstChild?.nodeType == 3) {
          elementText = firstChild.nodeValue;
        } else {
          firstChild = firstChild?.nextSibling;
        }
      }
      if (!elementText.trim()) {
        if (children > 1) {
          let prevElement = element;
          element = element.firstElementChild;
          for (let i = 0; i < children; i++) {
            if (element.textContent == "") {
              prevElement = element;
              element = element.nextElementSibling;
            } else {
              if (pseudoTextTags.indexOf(element.tagName) > -1) {
                prevElement = element;
                element = element.nextElementSibling;
              } else {
                elementText = element.textContent;
              }
            }
          }
          if (!element) {
            elementText = `tagX-${prevElement.tagName}`; // Handle various decorative elements such as img, svg, picture, style, etc
          }
        } else if (childNodes == 1) {
          if (element.textContent == "") {
            // TODO: Handle scenario when element has only one CHILD and that is blank text
            elementText = `tagX-${element.firstElementChild?.tagName}`; // Handle various decorative elements such as img, svg, picture, style, etc
          } else {
            elementText = element.textContent;
          }
        }
      }
      if (elementText.trim()) {
        refinedLinks.push({
          elementText: elementText,
          elementHref: elementHref,
          elementTarget: elementTarget,
        });
      } else {
        spookyLinks.push({
          elementText: elementText,
          elementHref: elementHref,
          elementTarget: elementTarget,
        });
      }
    }
  });
  let origin = parent.location.origin;
  let path = parent.location.href.split("/");
  let strippedPath = path.slice(0, path.length - 1).join("/");
  function formatLinks(elementHref) {
    let href = elementHref;
    if (elementHref.startsWith("/")) {
      href = `${origin}${elementHref}`;
    } else if (!elementHref.startsWith("http")) {
      href = `${strippedPath}/${elementHref}`;
    }
    return href;
  }
  refinedLinks = [
    ...new Set(refinedLinks.map((itm) => JSON.stringify(itm))),
  ].map((i) => JSON.parse(i));
  refinedLinks.map((refinedLink) => {
    refinedLink.elementHref = formatLinks(refinedLink.elementHref);
    refinedLink.elementText = refinedLink.elementText
      .trim()
      .replace(/\r?\n|\r/g, " ");
    const elementTarget = refinedLink.elementTarget;
    if (refinedLink.elementText.startsWith("tagX-"))
      decorativeLinks.push(refinedLink);
    else if (elementTarget == "_parent" || elementTarget == "_top")
      onThisPage.push(refinedLink);
    else if (elementTarget == "_blank") externalLinks.push(refinedLink);
    else otherLinks.push(refinedLink);
  });
  spookyLinks.map((spookyLink) => {
    spookyLink.elementText = spookyLink.elementHref;
    spookyLink.elementHref = formatLinks(spookyLink.elementHref);
  });
  spookyLinks = [...new Set(spookyLinks.map((itm) => JSON.stringify(itm)))].map(
    (i) => JSON.parse(i)
  );
  // mails
  const emailMatcher =
    /(?:[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gim;
  const pageSource = new XMLSerializer().serializeToString(document);
  const falseDomainsRx = [/.jpeg$/, /.jpg$/, /.png$/];
  let mailX = pageSource.match(emailMatcher);
  let refinedMails = [];
  mailX?.map((mail) => {
    if (!falseDomainsRx.some((fd) => fd.test(mail)))
      refinedMails.push(mail.toLowerCase());
  });
  refinedMails = [...new Set(refinedMails)];
  let receiver = document.getElementById("panXPanel").contentWindow;
  receiver.postMessage(
    {
      signal: "loadLinkX",
      onThisPage: onThisPage,
      externalLinks: externalLinks,
      decorativeLinks: decorativeLinks,
      otherLinks: otherLinks,
      spookyLinks: spookyLinks,
      mailX: refinedMails,
    },
    "*"
  );
}
