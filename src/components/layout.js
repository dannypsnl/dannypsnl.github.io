import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"
import { SocialIcon } from "react-social-icons"

import Header from "./header"
import "./layout.css"

const Layout = ({ children, pageTitle, headerTitle }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          description
        }
      }
    }
  `)

  return (
    <>
      <Header
        siteMetadata={data.site.siteMetadata}
        pageTitle={pageTitle}
        headerTitle={headerTitle}
      />
      <div>
        <main>{children}</main>
        <div
          style={{
            margin: `5rem auto 0 auto`,
            // alignSelf: `center`,
            maxWidth: `18rem`,
          }}
        >
          ©{new Date().getFullYear()} dannypsnl(林子篆)
          <div
            style={{
              display: `inline`,
              float: `right`,
            }}
          >
            <SocialIcon url="https://github.com/dannypsnl" />
            <SocialIcon url="https://twitter.com/dannypsnl" />
          </div>
        </div>
      </div>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
