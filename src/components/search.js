import React from "react"

export default ({ searchQuery, setSearchQuery }) => (
  <form
    style={{
      margin: `0 auto`,
      width: `11em`,
    }}
        action="/" method="get" autoComplete="off">
    <label htmlFor="header-search">
      <span className="visually-hidden">Search blog posts</span>
    </label>
    <input
      value={searchQuery}
      onInput={(e) => setSearchQuery(e.target.value)}
      type="text"
      id="header-search"
      placeholder="Search Posts"
      name="s"
    />
  </form>
)
