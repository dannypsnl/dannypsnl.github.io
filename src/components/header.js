import { graphql, Link, useStaticQuery } from "gatsby"
import PropTypes from "prop-types"
import React from "react"
import Img from "gatsby-image"

const Header = ({ siteMetadata, pageTitle, headerTitle }) => {
  const data = useStaticQuery(graphql`
    query {
      image: file(relativePath: { eq: "lambda-icon.png" }) {
        childImageSharp {
          # Specify the image processing specifications right in the query.
          # Makes it trivial to update as your page's design changes.
          fixed(width: 125, height: 125) {
            ...GatsbyImageSharpFixed
          }
        }
      }
    }
  `)
  let [dans, blog] = siteMetadata.title.split(" ")
  if (pageTitle) {
    blog = pageTitle
  }

  return (
    <header
      style={{
        marginBottom: `1.45rem`,
      }}
    >
      <title>{headerTitle ? headerTitle : "Dan's Blog"}</title>
      <div
        style={{
          textAlign: `center`,
          margin: `0 auto`,
          maxWidth: 960,
          padding: `1.45rem 0 0 0`,
        }}
      >
        <h1
          style={{
            margin: 0,
          }}
        >
          <Link
            to="/"
            style={{
              color: `#aba4a4`,
              textDecoration: `none`,
            }}
          >
            {dans}
            <Img fixed={data.image.childImageSharp.fixed} />
            {blog}
          </Link>
        </h1>
        <h4
          style={{
            color: `#aba4a4`,
            marginTop: 20,
          }}
        >
          {siteMetadata.description}
        </h4>
      </div>
      <ul
        style={{
          textAlign: `center`,
          backgroundColor: `#635c5c`,
          padding: `0`,
          margin: `0 auto`,
          borderRadius: `0.2em`,
          width: `18rem`,
        }}
      >
        <TabLink to={`/recommend`}>Recommend</TabLink>
        <TabLink to={`/project`}>Project</TabLink>
        <TabLink to={`/resume`}>Resume</TabLink>
      </ul>
    </header>
  )
}

const TabLink = ({ children, to }) => (
  <Link
    to={to}
    style={{
      textDecoration: `none`,
    }}
  >
    <li
      style={{
        color: `#fff8f8`,
        textAlign: `left`,
        margin: `auto 0.5em auto 0.5em`,
        borderRadius: `0.2em`,
        display: `inline`,
      }}
    >
      {children}
    </li>
  </Link>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: ``,
}

export default Header
