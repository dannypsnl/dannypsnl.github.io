import React from "react"

export default ({ searchQuery, setSearchQuery }) => (
  <form action="/" method="get" autoComplete="off">
    <label htmlFor="header-search">
      <span className="visually-hidden">Search blog posts</span>
    </label>
    <input
      style={{
        marginLeft: `20rem`,
        marginRight: `20rem`,
      }}
      value={searchQuery}
      onInput={(e) => setSearchQuery(e.target.value)}
      type="text"
      id="header-search"
      placeholder="Search Posts"
      name="s"
    />
  </form>
)
