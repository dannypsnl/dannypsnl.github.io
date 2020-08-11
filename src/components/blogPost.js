import React from "react"
import { Link } from "gatsby"
import { nameToYYYYMMDD } from "../utils/string-to-date"

export default ({
  tags,
  addTags,
  blogURL,
  title,
  timeToRead,
  fileName,
  excerpt,
  image,
}) => (
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
      <div
        style={{
          float: `left`,
        }}
      >
        {image ? image : ""}
      </div>
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
        {nameToYYYYMMDD(fileName)}
      </span>

      <p style={{ marginBottom: `0` }} />
      {tags.map((tag, index) => (
        <ShowTag index={index} addTag={addTags}>
          {tag}
        </ShowTag>
      ))}
    </div>

    <p>{excerpt}</p>
  </div>
)

const ShowTag = ({ children, index, addTag }) => (
  <button
    tabIndex={index}
    style={{
      margin: `0 0.2em 0 0.2em`,
      padding: `0.1em`,
      fontSize: `0.8rem`,
      backgroundColor: `Transparent`,
      color: `#aba4a4`,
      border: `solid 0.3px`,
      textAlign: `center`,
    }}
    onClick={(_) =>
      addTag({
        id: -1,
        name: children,
      })
    }
  >
    <em>{children}</em>
  </button>
)
