import React from "react"
import { Link } from "gatsby"

export default ({ blogURL, title, timeToRead, date, excerpt }) => (
  <div
    style={{
      margin: `2.7rem`,
    }}
  >
    <Link
      to={blogURL}
      style={{
        textDecoration: `none`,
      }}
    >
      <div>
        {/*  title*/}
        <h3
          style={{
            color: `rgb(25, 135, 153)`,
            marginBottom: `-0.2rem`,
          }}
        >
          {title}
        </h3>
      </div>
    </Link>
    <div
      style={{
        marginBottom: `0.5rem`,
      }}
    >
      <span
        style={{
          fontSize: `0.8rem`,
          color: `#aba4a4`,
        }}
      >
        {timeToRead} {" min read • "}
        {date}
      </span>

      <p style={{ marginBottom: `0` }} />
    </div>

    <p>{excerpt}</p>
  </div>
)
