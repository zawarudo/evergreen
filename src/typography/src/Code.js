import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { useTheme } from '../../theme'
import Text from './Text'

const Code = React.forwardRef(
  ({ appearance = 'default', className, ...props }, ref) => {
    const theme = useTheme()
    const {
      className: themedClassName = '',
      ...themeProps
    } = theme.getCodeProps(appearance)

    return (
      <Text
        is="code"
        ref={ref}
        className={cx(className, themedClassName)}
        fontFamily="mono"
        {...themeProps}
        {...props}
      />
    )
  }
)

Code.propTypes = {
  ...Text.propTypes,

  /**
   * The appearance of the code.
   */
  appearance: PropTypes.oneOf(['default', 'minimal']).isRequired,

  /**
   * Theme provided by ThemeProvider.
   */
  theme: PropTypes.object.isRequired,

  /**
   * Class name passed to the button.
   * Only use if you know what you are doing.
   */
  className: PropTypes.string
}

export default React.memo(Code)
