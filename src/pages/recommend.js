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
    allFile: { edges },
  },
}) => {
  const isBrowser = typeof window !== `undefined`
  const { search } = isBrowser ? window.location : { search: null }
  const query = new URLSearchParams(search).get("s")
  const [searchQuery, setSearchQuery] = useState(query || "")

  const normalize = (edges) =>
    edges.map(({ node }) => ({
      id: node.id,
      title: node.childMarkdownRemark.frontmatter.title,
      date: node.childMarkdownRemark.frontmatter.date
        ? Date.parse(node.childMarkdownRemark.frontmatter.date)
        : nameToDate(node.parent.name),
      text: node.childMarkdownRemark.frontmatter.text,
      link: node.childMarkdownRemark.frontmatter.link,
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
          placeholder={"Search Recommend"}
        />
        <h4 style={{ textAlign: `center` }}>{recommends.length} Recommend</h4>
        {
          // all recommends
          recommends.map((node) => (
            <div
              key={node.id}
              style={{
                margin: `2.7rem auto 2.7rem auto`,
                padding: `0.6rem`,
                border: `0.15rem solid #655`,
                borderRadius: `0.5rem`,
                width: `40rem`,
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
                  }}
                >
                  {node.title}
                </h3>
              </a>
              <p
                style={{
                  marginBottom: `0.2rem`,
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
    allFile(filter: { sourceInstanceName: { eq: "recommend" } }) {
      edges {
        node {
          id
          childMarkdownRemark {
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
  }
`
