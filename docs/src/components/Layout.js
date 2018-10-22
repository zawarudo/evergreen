import React from 'react' // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types'
import { Location } from '@reach/router'
import Helmet from 'react-helmet'
import {
  createTheme,
  ThemeProvider,
  defaultTheme,
  defaultThemeConfig
  // eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
} from 'evergreen-ui'
import absolutePath from '../absolutePath'
import { saveTheme, loadTheme } from '../theme-builder/themeLoader'
import '../css/index.css' // eslint-disable-line import/no-unassigned-import

const description =
  'Evergreen is a React UI Framework for building ambitious products on the web. Brought to you by Segment.'

const TemplateWrapper = ({ children }) => {
  return (
    <React.Fragment>
      <Helmet>
        {/* Fallback properties */}
        <title>Evergreen</title>
        <meta name="description" content={description} />
        <meta property="og:title" content="Evergreen" />
        <meta property="og:url" content={absolutePath()} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={absolutePath('/og-image.png')} />

        <meta property="twitter:card" content="summary" />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:site" content="@segment" />
        <meta name="twitter:creator" content="@Jeroen_Ransijn" />
        <meta
          property="twitter:image"
          content={absolutePath('/twitter-og.png')}
        />
      </Helmet>
      {children}
    </React.Fragment>
  )
}

TemplateWrapper.propTypes = {
  children: PropTypes.node
}

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    location: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)

    console.log(props.location)
    // This is different from the default theme.
    const themeStyles = loadTheme(props.location)

    if (themeStyles) {
      this.state = {
        isCustomTheme: true,
        themeStyles
      }
    } else {
      this.state = {
        isCustomTheme: false,
        themeStyles: defaultThemeConfig
      }
    }
  }

  componentDidMount() {
    // Give up.
    setTimeout(() => {
      this.forceUpdate()
    }, 100)
  }

  updateTheme = themeStyles => {
    const theme = createTheme(themeStyles)
    saveTheme(themeStyles)
    theme.isCustomTheme = true

    this.setState({
      isCustomTheme: true,
      themeStyles
    })
  }

  render() {
    const { children } = this.props
    const { themeStyles, isCustomTheme } = this.state

    let theme
    if (isCustomTheme) {
      theme = createTheme(themeStyles)
      theme.isCustomTheme = true
    } else {
      theme = defaultTheme
    }

    let finalChildren
    if (typeof children === 'function') {
      finalChildren = children({
        updateTheme: this.updateTheme,
        themeStyles,
        isCustomTheme
      })
    } else {
      finalChildren = children
    }

    return (
      <ThemeProvider value={theme}>
        <TemplateWrapper>{finalChildren}</TemplateWrapper>
      </ThemeProvider>
    )
  }
}

export default props => (
  <Location>
    {({ location }) => <Layout location={location} {...props} />}
  </Location>
)
