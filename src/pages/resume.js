import React from "react"
import SEO from "../components/seo"
import Layout from "../components/layout"
import SiteLink from "../components/site-link"
import { graphql } from "gatsby"

export default ({ data }) => {
  return (
    <Layout pageTitle={`Resume`}>
      <SEO title={`Resume`} description={data.site.siteMetadata.title} />
      <div>
        <div>
          <h2>Lîm Tsú-thuàn/林子篆/Danny</h2>
          <div>Programmer</div>
          <div>@Tainan, Taiwan</div>
          <div>
            Github: <SiteLink url={`https://github.com/dannypsnl`} />
          </div>
          <div>email: dannypsnl@gmail.com</div>
        </div>
        <div
          style={{
            marginTop: `1em`,
          }}
        >
          <Section>Overview</Section>
          <p>
            3+ years of development work experience, including compiler,
            networking, and web application. In-depth knowledge of Kubernetes
            and Container networking. A programming language theory lover and
            create several dependent type languages for fun. Use Racket and
            Arend in daily development.
          </p>
        </div>
        <div>
          <Section>Talks</Section>
          <ul>
            <li>
              2021/03
              <SiteLink url={`https://youtu.be/BLHxUzj7F-Q`}>
                racket fest: macro as type
              </SiteLink>
            </li>
          </ul>
        </div>
        <div>
          <Section>Work Experience</Section>
          <ul>
            <Job company="Glasnostic">
              Deeply work with nowadays networking fundamental(include but not
              limited to eBPF, DPDK) to maintain the product: a network
              filter/analyzer only need four norms: request, bandwidth,
              concurrency, and latency but able to manage complex
              infrastructure.
            </Job>
            <Job company="AndroVideo">
              Developing cloud web service with container-solution, and
              maintaining the device(camera) HMI system by communicating with
              the Android system.
            </Job>
            <Job company="Mapacode">
              Developing Human Machine Interface to interact with CNC.
            </Job>
          </ul>
        </div>
      </div>
    </Layout>
  )
}

const Job = ({ company, children }) => (
  <li
    style={{
      margin: `0rem`,
      padding: `0.1rem`,
      alignSelf: `center`,
    }}
  >
    <h4
      style={{
        color: `#04043`,
      }}
    >
      {company}
    </h4>
    <p
      style={{
        margin: `1.2rem 0rem`,
      }}
    >
      {children}
    </p>
  </li>
)

const Section = ({ children }) => (
  <h2
    style={{
      color: `#aba4a4`,
      paddingBottom: `0.3em`,
      borderBottom: `0.1em solid`,
    }}
  >
    {children}
  </h2>
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
