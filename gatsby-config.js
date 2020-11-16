function nameToYYYYMMDD(name) {
  return name.split(`-`).slice(0, 3).join(`-`)
}
function nameToDate(name) {
  return Date.parse(nameToYYYYMMDD(name))
}

module.exports = {
  siteMetadata: {
    title: `Dan's Blog`,
    description: `Programming Language Theory • System Programming`,
    author: `@dannypsnl`,
    siteUrl: `https://dannypsnl.github.io`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        display: `minimal-ui`,
        icon: `src/images/lambda-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          // for Image in Posts
          `gatsby-remark-relative-images`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              // It's important to specify the maxWidth (in pixels) of
              // the content container as this plugin uses this as the
              // base for generating different widths of each image.
              maxWidth: 590,
              linkImagesToOriginal: false,
              showCaptions: true,
            },
          },
          // for GIF, SVG images
          `gatsby-remark-static-images`,
          {
            // for LaTeX formula
            resolve: `gatsby-remark-katex`,
            options: {
              // Add any KaTeX options from https://github.com/KaTeX/KaTeX/blob/master/docs/options.md here
              strict: `ignore`,
            },
          },
          {
            // for code block highlighting
            resolve: `gatsby-remark-prismjs`,
            options: {
              // Class prefix for <pre> tags containing syntax highlighting;
              // defaults to 'language-' (eg <pre class="language-js">).
              // If your site loads Prism into the browser at runtime,
              // (eg for use with libraries like react-live),
              // you may use this to prevent Prism from re-processing syntax.
              // This is an uncommon use-case though;
              // If you're unsure, it's best to use the default value.
              classPrefix: `language-`,
              inlineCodeMarker: null,
              aliases: {
                racket: `scheme`,
              },
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `blog-posts`,
        path: `${__dirname}/src/blog-posts`,
        ignore: [`**/\.*`], // ignore files starting with a dot
      },
    },
    {
      resolve: "gatsby-plugin-local-search",
      options: {
        name: "pages",
        engine: "flexsearch",
        query: `
  query {
    allMarkdownRemark {
      edges {
        node {
          id
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
          parent {
            ... on File {
              name
            }
          }
        }
      }
    }
  }
`,
        ref: "slug",
        index: ["id", "title", "excerpt", "tags", "categories"],
        store: [
          "id",
          "excerpt",
          "title",
          "timeToRead",
          "slug",
          "tags",
          "categories",
          "date",
        ],
        normalizer: ({ data }) =>
          data.allMarkdownRemark.edges.map(({ node }) => ({
            id: node.id,
            excerpt: node.excerpt,
            timeToRead: node.timeToRead,
            title: node.frontmatter.title,
            slug: node.fields.slug,
            tags: node.frontmatter.tags,
            categories: node.frontmatter.categories,
            date: node.frontmatter.date
              ? Date.parse(node.frontmatter.date)
              : nameToDate(node.parent.name),
          })),
      },
    },
    // for rss feed
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              const nameToYYYYMMDD = (name) =>
                name.split(`-`).slice(0, 3).join(`-`)
              const nameToDate = (name) => Date.parse(nameToYYYYMMDD(name))
              return allMarkdownRemark.edges.map((edge) => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  date: nameToDate(edge.node.parent.name),
                  url: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  guid: site.siteMetadata.siteUrl + edge.node.fields.slug,
                  custom_elements: [{ "content:encoded": edge.node.html }],
                })
              })
            },
            query: `
              {
                allMarkdownRemark(
                  sort: { order: DESC, fields: [frontmatter___date] },
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields { slug }
                      frontmatter {
                        title
                      }
                      fields {
                        slug
                      }
                      parent {
                        ... on File {
                          name
                        }
                      }
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "Dan's Blog's RSS Feed",
          },
        ],
      },
    },
    // Google Analytics
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-115056015-1",
        head: `true`,
        cookieDomain: "dannypsnl.github.io",
      },
    },
  ],
}
