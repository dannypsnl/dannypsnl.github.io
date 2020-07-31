import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { Disqus } from "gatsby-plugin-disqus"
import SiteLink from "../components/site-link"

import "../styles/code-block-theme.css"
import "../styles/code-block-hightlight.css"
import { LicenseCC4 } from "../components/licensecc4"
import { BuyMeACoffee } from "../components/buy-me-a-coffe"

export default ({ data }) => {
  const FooterSection = ({ children }) => (
    <p
      style={{
        marginBottom: `0`,
      }}
    >
      {children}
    </p>
  )
  const ShowTag = ({ children }) => (
    <em
      style={{
        margin: `0.2em`,
        padding: `0.1em`,
        color: `#aba4a4`,
        border: `solid 0.3px`,
        textAlign: `center`,
      }}
    >
      {children}
    </em>
  )

  const post = data.markdownRemark
  const disqusConfig = {
    url: `${data.site.siteMetadata.siteUrl + post.slug}`,
    identifier: post.id,
    title: post.frontmatter.title,
  }
  return (
    <Layout>
      <div>
        <h1>{post.frontmatter.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
        <FooterSection>
          author:{" "}
          <SiteLink url={`https://github.com/dannypsnl`}>dannypsnl</SiteLink>
        </FooterSection>
        <FooterSection>
          category:
          {post.frontmatter.categories.map((category) => (
            <ShowTag>{category}</ShowTag>
          ))}
        </FooterSection>
        <FooterSection>
          tag:
          {post.frontmatter.tags.map((tag) => (
            <ShowTag>{tag}</ShowTag>
          ))}
        </FooterSection>
        <p />
        <SimilarArticlesComponent
          currentArticle={{
            title: post.frontmatter.title,
            categories: post.frontmatter.categories,
            tags: post.frontmatter.tags,
          }}
          articles={data.allMarkdownRemark.edges.map((edge) => edge.node)}
        />
        <BuyMeACoffee />
        <LicenseCC4 />
        <Disqus config={disqusConfig} />
      </div>
    </Layout>
  )
}

const difference = (a, b) =>
  a.filter((x) => !b.includes(x)).concat(b.filter((x) => !a.includes(x)))
const intersection = (a, b) => a.filter((x) => b.includes(x))
const same = (a, b) => {
  return difference(a, b).length === 0
}

const SimilarArticlesComponent = ({ currentArticle, articles }) => {
  let shows = articles
    .filter(
      (article) =>
        same(article.frontmatter.categories, currentArticle.categories) &&
        article.frontmatter.title !== currentArticle.title
    )
    .sort((article1, article2) => {
      let a = intersection(article1.frontmatter.tags, currentArticle.tags)
      let b = intersection(article2.frontmatter.tags, currentArticle.tags)

      if (b.length > a.length) {
        return 1
      } else if (b.length === a.length) {
        return 0
      } else {
        return -1
      }
    })
    .slice(0, 4)

  return (
    <>
      <h4>Similar Articles</h4>
      <section className="similar-articles">
        <ul>
          {shows.map((article, i) => (
            <li key={i}>
              <a href={article.fields.slug}>{article.frontmatter.title}</a>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export const query = graphql`
  query($slug: String!) {
    site {
      siteMetadata {
        siteUrl
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        categories
        tags
      }
    }
    allMarkdownRemark {
      edges {
        node {
          id
          frontmatter {
            title
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
`
