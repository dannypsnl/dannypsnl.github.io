import React, { useState } from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql } from "gatsby"
import { nameToDate } from "../utils/string-to-date"
import SearchBar from "../components/search"
import "./index.css"
import "../styles/tags.css"
import { useFlexSearch } from "react-use-flexsearch"

const RecommendPage = ({
  data: {
    site: {
      siteMetadata: { title },
    },
    localSearchRecommend: { index, store },
    allMarkdownRemark: { edges },
  },
}) => {
  const isBrowser = typeof window !== `undefined`
  const { search } = isBrowser ? window.location : { search: null }
  const query = new URLSearchParams(search).get("s")
  const [searchQuery, setSearchQuery] = useState(query || "")

  const normalize = (edges) =>
    edges.map(({ node }) => ({
      id: node.id,
      title: node.frontmatter.title,
      date: node.frontmatter.date
        ? Date.parse(node.frontmatter.date)
        : nameToDate(node.parent.name),
      text: node.frontmatter.text,
      link: node.frontmatter.link,
    }))

  const results = useFlexSearch(searchQuery, index, store)
  const recommends = searchQuery ? results : normalize(edges)

  recommends.sort((a, b) => b.date - a.date)

  return (
    <Layout pageTitle={`Recommend`}>
      <SEO title={`Recommend`} description={title} />
      <div>
        <SearchBar
          style={{ margin: `0 auto` }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <h4 style={{ textAlign: `center` }}>{recommends.length} Posts</h4>
        {
          // all recommends
          recommends.map((node) => {
            return (
              <div key={node.id}>
                <div
                  style={{
                    margin: `2.7rem`,
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
                    <div>
                      {/*  title*/}
                      <h3
                        style={{
                          color: `rgb(25, 135, 153)`,
                          marginBottom: `0.5rem`,
                        }}
                      >
                        {node.title}
                      </h3>
                    </div>
                  </a>
                  <p>{node.text}</p>
                </div>
              </div>
            )
          })
        }
      </div>
    </Layout>
  )
}

export default RecommendPage

export const query = graphql`
  query {
    localSearchRecommend {
      index
      store
    }
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(filter: { rawMarkdownBody: { eq: "" } }) {
      edges {
        node {
          id
          frontmatter {
            title
            date
            text
            link
          }
        }
      }
    }
  }
`
