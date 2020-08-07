import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import SiteLink from "../components/site-link"
import { graphql } from "gatsby"

export default ({ data }) => {
  const recommends = [
    {
      title: `Racket`,
      sites: [
        { link: `https://beautifulracket.com/`, name: `Beautiful Racket` },
      ],
    },
    {
      title: `Blog`,
      sites: [
        {
          link: `https://alex-hhh.github.io/index.html`,
          name: `Alex Harsányi`,
        },
        { link: `https://ice1000.org/`, name: `ice1000` },
        { link: `https://wusyong.github.io/`, name: `Ngo Iok Ui` },
        { link: `https://franknine.github.io/`, name: `Northern Wind` },
        { link: `https://viktorl.in/Blog/`, name: `Viktor Lin` },
      ],
    },
    {
      title: `Arend`,
      sites: [
        {
          link: `https://arend-lang.github.io/`,
          name: `Arend theorem prover`,
        },
      ],
    },
    {
      title: `Agda`,
      sites: [
        {
          link: `https://people.inf.elte.hu/divip/AgdaTutorial/Symbols.html`,
          name: `Agda symbols`,
        },
      ],
    },
    {
      title: `Haskell`,
      sites: [
        {
          link: `http://dev.stephendiehl.com/hask/`,
          name: `WHAT I WISH I KNEW WHEN LEARNING HASKELL`,
        },
        { link: `https://typeclasses.com/sitemap`, name: `typeclasses` },
      ],
    },
    {
      title: `Coq`,
      sites: [
        {
          link: `https://coq.inria.fr/`,
          name: `Coq proof assistant`,
        },
      ],
    },
    {
      title: `Solver`,
      sites: [
        {
          link: `https://homes.cs.washington.edu/~emina/doc/rosette.pldi14.pdf`,
          name: `Rosette`,
        },
      ],
    },
  ]

  return (
    <Layout pageTitle={`Recommend`}>
      <SEO title={`Recommend`} description={data.site.siteMetadata.title} />
      <div>
        {recommends.map((recommend) => (
          <>
            <h3>{recommend.title}</h3>
            <ul>{recommend.sites.map((site) => SiteLi({ site }))}</ul>
          </>
        ))}
      </div>
    </Layout>
  )
}

const SiteLi = ({ site }) => (
  <li>
    <div
      style={{
        display: `inline`,
        marginRight: `0.2em`,
      }}
    >
      <SiteLink url={site.link}>{site.name}</SiteLink>
    </div>
  </li>
)

export const query = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
