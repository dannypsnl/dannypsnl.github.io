import React, { useState } from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql } from "gatsby"
import { nameToDate } from "../utils/string-to-date"
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
            frontmatter: { title, date, link, tags },
          },
        },
      }) => ({
        id,
        title,
        date: date ? Date.parse(date) : nameToDate(parent.name),
        link,
        tags,
        html,
      })
    )

  const results = useFlexSearch(searchQuery, index, store)
  const recommends = searchQuery ? results : normalize(edges)

  recommends.sort((a, b) => b.date - a.date)

  return (
    <Layout pageTitle={`Project`}>
      <SEO title={`Project`} description={title} />
      <div>
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
                margin: `2rem auto`,
                padding: `0.9rem 0.9rem 0rem 0.9rem`,
                border: `0.15rem solid ${
                  node.tags !== null && node.tags.includes("working")
                    ? `#ffbe0b`
                    : `#655`
                }`,
                borderRadius: `0.5rem`,
                width: `20rem`,
                alignSelf: `center`,
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
                      padding: `0.3rem`,
                      border: `0.15rem solid #655`,
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
              date
              link
              tags
            }
          }
        }
      }
    }
  }
`
