import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql } from "gatsby"

export default ({ data }) => {
  const contributions = [
    {
      link: `https://dannypsnl.github.io/plt-research/research/linear-or-gc.html`,
      description: `Linear or GC`,
    },
    {
      link: `https://dannypsnl.github.io/logical/logic-programming.html`,
      description: `Logic Programming`,
    },
  ]

  return (
    <Layout pageTitle={`Research`}>
      <SEO title={`Research`} description={data.site.siteMetadata.title} />
      <div>
        {contributions.map(({ link, description }) => (
          <li>
            <div
              style={{
                display: `inline`,
                marginRight: `0.2em`,
              }}
            >
              <a href={link} rel="noopener noreferrer">
                {description}
              </a>
            </div>
          </li>
        ))}
      </div>
    </Layout>
  )
}

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
