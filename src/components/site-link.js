import React from "react"

const SiteLink = ({ url, children }) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {children ? children : url}
  </a>
)

export default SiteLink
