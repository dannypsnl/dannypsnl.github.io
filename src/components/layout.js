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
      <div
        style={{
          margin: `0 auto`,
          maxWidth: 960,
          padding: `0 1.0875rem 1.45rem`,
        }}
      >
        <main>{children}</main>
        <footer>
          <div>
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
        </footer>
      </div>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
