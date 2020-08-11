import React from "react"

const Utterances = () => (
  <section
    ref={(elem) => {
      if (!elem) {
        return
      }
      const scriptElem = document.createElement("script")
      scriptElem.src = "https://utteranc.es/client.js"
      scriptElem.async = true
      scriptElem.crossOrigin = "anonymous"
      scriptElem.setAttribute("repo", "dannypsnl/dannypsnl.github.io")
      scriptElem.setAttribute("issue-term", "url")
      scriptElem.setAttribute("label", "Utterances")
      scriptElem.setAttribute("theme", "github-light")
      elem.appendChild(scriptElem)
    }}
  />
)

export default Utterances
