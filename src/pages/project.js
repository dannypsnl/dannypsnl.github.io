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
            frontmatter: { title, date, text, link, tags },
          },
        },
      }) => ({
        id,
        title,
        date: date ? Date.parse(date) : nameToDate(parent.name),
        text,
        link,
        tags,
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
                padding: `0.6rem`,
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
                      margin: `0.6rem 0`,
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
              <p
                style={{
                  marginTop: `0.5rem`,
                  marginBottom: 0,
                }}
              >
                {node.text}
              </p>
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
            frontmatter {
              title
              date
              text
              link
              tags
            }
          }
        }
      }
    }
  }
`
