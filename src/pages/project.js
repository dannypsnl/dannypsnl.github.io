import React, { useState } from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql } from "gatsby"
import SearchBar from "../components/search"
import "./index.css"
import "../styles/tags.css"
import { useFlexSearch } from "react-use-flexsearch"

const ProjectPage = ({
  data: {
    site: {
      siteMetadata: { title },
    },
    localSearchProject: { index, store },
    allFile: { edges },
  },
}) => {
  const isBrowser = typeof window !== `undefined`
  const { search } = isBrowser ? window.location : { search: null }
  const query = new URLSearchParams(search).get("s")
  const [searchQuery, setSearchQuery] = useState(query || "")

  const normalize = (edges) =>
    edges.map(
      ({
        node: {
          id,
          parent,
          childMarkdownRemark: {
            html,
            frontmatter: { title, link, tags },
          },
        },
      }) => ({
        id,
        title,
        link,
        tags,
        html,
      })
    )

  const results = useFlexSearch(searchQuery, index, store)
  const recommends = searchQuery ? results : normalize(edges)

  return (
    <Layout pageTitle={`Project`}>
      <SEO title={`Project`} description={title} />
      <div style={{ margin: `0` }}>
        <SearchBar
          style={{ margin: `0 auto` }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={"Search Project"}
        />
        <h4 style={{ textAlign: `center` }}>{recommends.length} Projects</h4>
        {
          // all recommends
          recommends.map((node) => (
            <div
              key={node.id}
              style={{
                margin: `0.2rem`,
                padding: `0.6rem 0.6rem 0rem 0.6rem`,
                border: `0.1rem solid ${
                  node.tags !== null && node.tags.includes("working")
                    ? `#ffbe0b`
                    : `#655`
                }`,
                borderRadius: `0.4rem`,
                width: `19.5rem`,
                float: `left`,
              }}
            >
              <a
                href={node.link}
                target={"_blank"}
                rel={"noreferrer"}
                style={{
                  textDecoration: `none`,
                }}
              >
                <h3
                  style={{
                    color: `rgb(25, 135, 153)`,
                    marginBottom: `0.5rem`,
                  }}
                >
                  {node.title}
                </h3>
              </a>
              {node.tags ? (
                node.tags.map((tag) => (
                  <small
                    key={tag}
                    style={{
                      margin: `0.6rem 0.1rem`,
                      padding: `0.2rem`,
                      border: `0.1rem solid #655`,
                      borderRadius: `0.5rem`,
                      width: `auto`,
                    }}
                  >
                    {tag}
                  </small>
                ))
              ) : (
                <></>
              )}
              <div
                style={{
                  marginTop: `0.8rem`,
                  marginBottom: 0,
                }}
                dangerouslySetInnerHTML={{ __html: node.html }}
              />
            </div>
          ))
        }
      </div>
    </Layout>
  )
}

export default ProjectPage

export const query = graphql`
  query {
    localSearchProject {
      index
      store
    }
    site {
      siteMetadata {
        title
      }
    }
    allFile(filter: { sourceInstanceName: { eq: "project" } }) {
      edges {
        node {
          id
          childMarkdownRemark {
            html
            frontmatter {
              title
              link
              tags
            }
          }
        }
      }
    }
  }
`
