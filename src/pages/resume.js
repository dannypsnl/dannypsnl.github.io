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
          <div>System Software Engineer</div>
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
            3+ years of development work experience, including networking,
            compiler, and web application. In-depth knowledge of Kubernetes and
            Container networking. A programming language theory lover. Like
            Racket, Rust, and Arend.
          </p>
        </div>
        <div>
          <Section>Work Experience</Section>
          <Position
            title={`Sky Mirror(software engineer)`}
            companySite={`https://www.skymirror.com.tw/`}
          >
            Maintaining a future trading system.
          </Position>
          <Position
            title={`Glasnostic(system software engineer)`}
            companySite={`https://glasnostic.com`}
          >
            Create the networking filter & analyzer which easy to use(only four
            norms: request, bandwidth, concurrency and latency) for nowadays
            complex backend system.
          </Position>
          <Position
            title={`AndroVideo(back-end engineer)`}
            companySite={`http://www.androvideo.com/`}
          >
            Developing cloud web service with container-solution. Maintaining
            the device(camera) HMI system by communicating with the Android
            system.
          </Position>
          <Position title={`Mapacode(fullstack engineer)`}>
            Developing HMI of CNC by React.js & Rust working with Rust & a
            little C++ to interact with CNC
          </Position>
        </div>
      </div>
    </Layout>
  )
}

const Position = ({ title, companySite, children }) => (
  <div>
    <b>{title}</b>
    {companySite ? (
      <>
        {" "}
        <SiteLink url={companySite} />
      </>
    ) : null}
    <p>{children}</p>
  </div>
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
