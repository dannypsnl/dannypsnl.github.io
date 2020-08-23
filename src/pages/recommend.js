import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import SiteLink from "../components/site-link"
import { graphql } from "gatsby"

export default ({ data }) => {
  const recommends = [
    {
      title: `Scheme/Racket`,
      sites: [
        {
          link: `http://cisco.github.io/ChezScheme/csug9.5/csug.html`,
          name: `Chez Scheme Version 9 User's Guide`,
        },
        { link: `https://beautifulracket.com/`, name: `Beautiful Racket` },
        {
          link: `https://www.scheme.com/tspl4/`,
          name: `The Scheme Programming Language`,
        },
        {
          link: `https://mlemmer.org/HowTo.html`,
          name: `How To Use Scribble to Write your Academic Papers:`,
        },
      ],
    },
    {
      title: `Blog`,
      sites: [
        {
          link: `https://alex-hhh.github.io/index.html`,
          name: `[Racket] Alex Harsányi`,
        },
        { link: `https://ice1000.org/`, name: `[PLT] ice1000` },
        { link: `https://wusyong.github.io/`, name: `Ngo Iok Ui` },
        { link: `https://franknine.github.io/`, name: `Northern Wind` },
        { link: `https://viktorl.in/Blog/`, name: `Viktor Lin` },
        {
          link: `https://edwinb.wordpress.com/blog/`,
          name: `[PLT] Edwin Brady`,
        },
        {
          link: `http://davidchristiansen.dk/blog/`,
          name: `[PLT] David Thrane Christiansen`,
        },
        { link: `http://matt.might.net/articles/`, name: `[PLT] matt might` },
        {
          link: `http://math.ucr.edu/home/baez/`,
          name: `[Math] John Baez’s Stuff`,
        },
        { link: `https://desvl.xyz/archives/`, name: `[Math] Desvl` },
        { link: `https://www.math3ma.com/`, name: `[Math] math3ma` },
        {
          link: `https://golem.ph.utexas.edu/category/`,
          name: `[Math] The n-Category Café`,
        },
        {
          link: `https://w3.math.sinica.edu.tw/mathmedia/default.jsp`,
          name: `[Math] 數學傳播`,
        },
        {
          link: `https://homes.cs.washington.edu/~emina/index.html`,
          name: `[PLT] Emina Torlak`,
        },
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
      title: `Isabelle`,
      sites: [
        {
          link: `https://isabelle.in.tum.de/`,
          name: `Isabelle`,
        },
      ],
    },
    {
      title: `Coq`,
      sites: [
        {
          link: `https://coq.inria.fr/`,
          name: `Coq`,
        },
        {
          link: `https://coq-zh.github.io/SF-zh/`,
          name: `Software Foundations: Chinese Translation`,
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
      title: `Idris`,
      sites: [
        {
          link: `https://www.idris-lang.org/`,
          name: `Idris`,
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
