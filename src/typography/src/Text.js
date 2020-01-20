import cx from 'classnames'
import { css as glamorCss } from 'glamor'
import React from 'react'
import PropTypes from 'prop-types'
import Box from 'ui-box'
import { useTheme } from '../../theme'

const Text = React.forwardRef(
  (
    {
      className,
      css,
      size = 400,
      color = 'default',
      fontFamily = 'ui',
      marginTop,
      ...props
    },
    ref
  ) => {
    const theme = useTheme()
    const { marginTop: defaultMarginTop, ...textStyle } = theme.getTextStyle(
      size
    )
    const finalMarginTop =
      marginTop === 'default' ? defaultMarginTop : marginTop

    return (
      <Box
        is="span"
        innerRef={ref}
        color={theme.getTextColor(color)}
        fontFamily={theme.getFontFamily(fontFamily)}
        marginTop={finalMarginTop}
        {...textStyle}
        className={cx(className, css ? glamorCss(css).toString() : undefined)}
        {...props}
      />
    )
  }
)

Text.displayName = 'Text'

Text.propTypes = {
  /**
   * Composes the Box component as the base.
   */
  ...Box.propTypes,

  /**
   * Size of the text style.
   * Can be: 300, 400, 500, 600.
   */
  size: PropTypes.oneOf([300, 400, 500, 600]).isRequired,

  /**
   * Font family.
   * Can be: `ui`, `display` or `mono` or a custom font family.
   */
  fontFamily: PropTypes.string.isRequired
}

export default React.memo(Text)
