window.addEventListener("message", function (ev) {
  if (ev.data.signal == "loadLinkX") {
    lumpAndDump(
      ev.data.onThisPage,
      ev.data.externalLinks,
      ev.data.decorativeLinks,
      ev.data.otherLinks,
      ev.data.spookyLinks,
      ev.data.mailX
    );
  }
});
function lumpAndDump(
  onThisPage,
  externalLinks,
  decorativeLinks,
  otherLinks,
  spookyLinks,
  mailX
) {
  let hasContent = false;
  if (onThisPage.length) {
    linkInjector(onThisPage, "onThisPage", "lopCount");
    hasContent = true;
  }
  if (externalLinks.length) {
    linkInjector(externalLinks, "externalLinks", "elCount");
    hasContent = true;
  }
  if (decorativeLinks.length) {
    linkInjector(decorativeLinks, "decorativeLinks", "dlCount");
    hasContent = true;
  }
  if (otherLinks.length) {
    linkInjector(otherLinks, "otherLinks", "olCount");
    hasContent = true;
  }
  if (spookyLinks.length) {
    linkInjector(spookyLinks, "spookyLinks", "slCount");
    hasContent = true;
  }
  if (mailX.length) {
    mailInjector(mailX, "eCount");
    hasContent = true;
  }
  if (hasContent) {
    document
      .getElementById("linkXAccordion")
      .classList.remove("visually-hidden");
  }
}
const colorArray = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];
function linkInjector(linkArray, id, countId) {
  let fragment = document.createDocumentFragment();
  const element = document.getElementById(`${id}`);
  document.getElementById(`${countId}`).textContent = linkArray.length;
  const loader = document.getElementById("loader");
  fragment = linkElement(linkArray, fragment);
  element.parentElement.parentElement.parentElement.classList.remove(
    "visually-hidden"
  );
  loader.classList.add("visually-hidden");
  setTextContent(id); // empty the section
  element.appendChild(fragment);
}
function mailInjector(mailArray, countId) {
  let fragment = document.createDocumentFragment();
  const element = document.getElementById("emails");
  document.getElementById(`${countId}`).textContent = mailArray.length;
  const loader = document.getElementById("loader");
  fragment = mailElement(mailArray, fragment);
  element.parentElement.parentElement.parentElement.classList.remove(
    "visually-hidden"
  );
  loader.classList.add("visually-hidden");
  setTextContent("emails"); // empty the section
  element.appendChild(fragment);
}
function linkElement(linkArray, fragment) {
  linkArray.forEach((link) => {
    let button = document.createElement("button");
    button.setAttribute(
      "class",
      `btn btn-light btn-sm m-1 text-truncate rounded-pill ${
        colorArray[Math.floor(Math.random() * colorArray.length)]
      }`
    );
    let a = document.createElement("a");
    a.setAttribute("class", "link-dark linX");
    a.textContent = link.elementText;
    a.href = link.elementHref;
    a.target = link.elementTarget;
    const copy = copyElement("linX");
    button.appendChild(copy);
    button.appendChild(a);
    fragment.appendChild(button);
  });
  return fragment;
}
function mailElement(mailArray, fragment) {
  mailArray.forEach((mail) => {
    let button = document.createElement("button");
    button.setAttribute(
      "class",
      `btn btn-light btn-sm m-1 text-truncate rounded-pill ${
        colorArray[Math.floor(Math.random() * colorArray.length)]
      }`
    );
    let a = document.createElement("a");
    a.setAttribute("class", "link-dark");
    a.textContent = mail;
    const copy = copyElement("mailX");
    button.appendChild(copy);
    button.appendChild(a);
    fragment.appendChild(button);
  });
  return fragment;
}
function copyElement(id) {
  let span = document.createElement("span");
  span.setAttribute("class", "copyX");
  span.setAttribute("id", `${id}`);
  span.innerHTML = "&nbsp;";
  return span;
}
document.addEventListener("click", function (e) {
  if ((e.target && e.target.id == "linX") || e.target.id == "mailX") {
    const href =
      e.target.id == "linX"
        ? e.target.nextSibling.href
        : e.target.nextSibling.textContent;
    navigator.clipboard.writeText(href).then(
      function () {
        e.target.style.backgroundImage = "url('images/tick.svg')";
        setTimeout(function () {
          e.target.style.backgroundImage = "url('images/copy.svg')";
        }, 1000);
      },
      function (err) {
        console.error("Async: Could not copy text: ", err);
      }
    );
  }
});
document.getElementById("rerun").addEventListener("click", function (e) {
  document.getElementById("loader").classList.remove("visually-hidden");
  document.getElementById("linkXAccordion").classList.add("visually-hidden");
  [
    "onThisPage",
    "externalLinks",
    "decorativeLinks",
    "otherLinks",
    "spookyLinks",
    "emails",
  ].forEach((id) => {
    setTextContent(id, true); // add blank state message
  });
  parent.postMessage("rerun", "*");
});
function setTextContent(id, setPlaceholderText) {
  document.getElementById(`${id}`).textContent = setPlaceholderText
    ? "None that we can find at the moment..."
    : "";
}
