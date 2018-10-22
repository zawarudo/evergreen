import React from 'react'
import PropTypes from 'prop-types'
import { Pane } from '../../../../src/layers'
import SyntaxHighlighter from '../../components/SyntaxHighlighter'
import Section from './Section'

export default class CodeSnippet extends React.Component {
  static propTypes = {
    value: PropTypes.object
  }

  render = () => {
    return (
      <Section
        title="Theme Snippet"
        fileName="CodeSnippet.js"
        contentPadding={0}
      >
        <Pane>
          <SyntaxHighlighter
            style={{
              marginTop: 0,
              marginBottom: 0,
              borderRadius: 0,
              fontSize: 12
            }}
          >
            {`import React from 'react'
import ReactDOM from 'react-dom'
import { createTheme, ThemeProvider } from 'evergreen-ui'

const theme = createTheme(${JSON.stringify(this.props.value, null, 2)})

const Root = () => (
  <ThemeProvider value={theme}>
    Your app goes here
  </ThemeProvider>
)

ReactDOM.render(<Root />, document.querySelector('#root'))`}
          </SyntaxHighlighter>
        </Pane>
      </Section>
    )
  }
}
