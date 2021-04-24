import React, { useState } from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"
import { graphql } from "gatsby"
import BlogPost from "../components/blogPost"
import { nameToDate } from "../utils/string-to-date"
import SearchBar from "../components/search"
import "./index.css"
import "../styles/tags.css"
import { useFlexSearch } from "react-use-flexsearch"

const IndexPage = ({
  data: {
    site: {
      siteMetadata: { title, description },
    },
    localSearchPages: { index, store },
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
          name,
          childMarkdownRemark: {
            excerpt,
            timeToRead,
            frontmatter: { title, tags, categories, date },
            fields: { slug },
          },
        },
      }) => ({
        id,
        excerpt,
        timeToRead,
        title,
        slug,
        tags,
        categories,
        date: date ? Date.parse(date) : nameToDate(name),
      })
    )

  const results = useFlexSearch(searchQuery, index, store)
  const posts = searchQuery ? results : normalize(edges)

  posts.sort((a, b) => b.date - a.date)

  return (
    <Layout>
      <SEO title={title} description={description} />
      <div
        style={{
          margin: `0 auto`,
          padding: `0 1.0875rem 1.45rem`,
          maxWidth: 960,
        }}
      >
        <SearchBar
          style={{ margin: `0 auto` }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <h4 style={{ textAlign: `center` }}>{posts.length} Posts</h4>
        {
          // all posts
          posts.map((node) => {
            return (
              <div key={node.id}>
                <BlogPost
                  tags={node.tags}
                  blogURL={node.slug}
                  title={node.title}
                  timeToRead={node.timeToRead}
                  date={node.date}
                  excerpt={node.excerpt}
                />
              </div>
            )
          })
        }
      </div>
    </Layout>
  )
}

export default IndexPage

export const query = graphql`
  query {
    localSearchPages {
      index
      store
    }
    site {
      siteMetadata {
        title
        description
      }
    }
    allFile(filter: { sourceInstanceName: { eq: "blog-posts" } }) {
      edges {
        node {
          id
          name
          childMarkdownRemark {
            excerpt
            timeToRead
            frontmatter {
              title
              date
              categories
              tags
            }
            fields {
              slug
            }
          }
        }
      }
    }
  }
`
