import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import fuzzaldrin from 'fuzzaldrin-plus'
import VirtualList from 'react-tiny-virtual-list'
import { Pane } from '../../layers'
import { TableHead, SearchTableHeaderCell } from '../../table'
import OptionShapePropType from './OptionShapePropType'
import Option from './Option'

/**
 * Fuzzaldrin-plus is the default filter, but you can use your own
 * as long as they follow the following signature:
 * @param options <Array[String]> - ['label', 'label2', ...]
 * @param input <String>
 */
const fuzzyFilter = (options, input, { key }) => {
  return fuzzaldrin.filter(options, input, { key })
}

/**
 * This is the default item renderer of options
 * you can pass custom renderers as long as they work the same as the Option
 */
const itemRenderer = props => <Option {...props} />

export default class OptionsList extends PureComponent {
  static propTypes = {
    options: PropTypes.arrayOf(OptionShapePropType),
    close: PropTypes.func,
    height: PropTypes.number,
    width: PropTypes.number,

    /**
     * When true, multi select is accounted for.
     */
    isMultiSelect: PropTypes.bool,

    /**
     * When true, menu closes on option selection.
     */
    closeOnSelect: PropTypes.bool,

    /**
     * This holds the values of the options
     */
    selected: PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    ),
    onSelect: PropTypes.func,
    onDeselect: PropTypes.func,
    onFilterChange: PropTypes.func,
    hasFilter: PropTypes.bool,
    optionSize: PropTypes.number,
    renderItem: PropTypes.func,
    filterPlaceholder: PropTypes.string,
    filterIcon: PropTypes.string,
    optionsFilter: PropTypes.func,
    defaultSearchValue: PropTypes.string
  }

  static defaultProps = {
    options: [],
    /**
     * Including border bottom
     * For some reason passing height to TableRow doesn't work
     * TODO: fix hacky solution
     */
    optionSize: 33,
    onSelect: () => {},
    onDeselect: () => {},
    onFilterChange: () => {},
    selected: [],
    renderItem: itemRenderer,
    filterPlaceholder: 'Filter...',
    filterIcon: 'search',
    defaultSearchValue: ''
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      searchValue: props.defaultSearchValue,
      currentIndex: 0
    }
  }

  componentDidMount() {
    const { hasFilter } = this.props
    if (!hasFilter) return
    /**
     * Hacky solution for broken autoFocus
     * https://github.com/segmentio/evergreen/issues/90
     */
    requestAnimationFrame(() => {
      this.searchRef.querySelector('input').focus()
    })

    window.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  isSelected = item => {
    const { selected } = this.props

    return Boolean(selected.find(selectedItem => selectedItem === item.value))
  }

  search = options => {
    const { optionsFilter } = this.props
    const { searchValue } = this.state

    if (searchValue.trim() === '') {
      return options
    }

    // Preserve backwards compatibility with allowing custom filters, which accept array of strings
    if (typeof optionsFilter === 'function') {
      return optionsFilter(options.map(item => item.label), searchValue).map(
        name => options.find(item => item.label === name)
      )
    }

    return fuzzyFilter(options, searchValue, { key: 'label' })
  }

  getFilteredOptions() {
    const { options } = this.props

    return this.search(options)
  }

  handleKeyDown = e => {
    if (e.keyCode === 37) {
      this.handleKeyLeft()
    }

    if (e.keyCode === 38) {
      this.handleArrowUp()
    }

    if (e.keyCode === 39) {
      this.handleArrowRight()
    }

    if (e.keyCode === 40) {
      this.handleArrowDown()
    }

    if (e.keyCode === 13) {
      this.handleEnter()
    }
  }

  handleArrowRight = () => {
    this.handleSelect(this.props.options[this.state.currentIndex])
  }

  handleKeyLeft = () => {
    this.handleDeselect(this.props.options[this.state.currentIndex])
  }

  handleArrowUp = () => {
    const nextIndex = Math.max(this.state.currentIndex - 1, 0)
    this.setState(prevState => {
      return { ...prevState, currentIndex: nextIndex }
    })
  }

  handleArrowDown = () => {
    const nextIndex = Math.min(
      this.state.currentIndex + 1,
      this.props.options.length - 1
    )
    this.setState(prevState => {
      return { ...prevState, currentIndex: nextIndex }
    })
  }

  handleEnter = () => {
    if (this.isSelected(this.props.options[this.state.currentIndex])) {
      this.props.close()
    }
  }

  handleChange = searchValue => {
    this.setState({
      searchValue
    })
    this.props.onFilterChange(searchValue)
  }

  handleSelect = item => {
    this.props.onSelect(item)
    if (!this.props.isMultiSelect && this.props.closeOnSelect) {
      this.props.close()
    }
  }

  handleDeselect = item => {
    this.props.onDeselect(item)
  }

  assignSearchRef = ref => {
    this.searchRef = ref
  }

  render() {
    const {
      options: originalOptions,
      close,
      width,
      height,
      onSelect,
      onDeselect,
      onFilterChange,
      selected,
      hasFilter,
      filterPlaceholder,
      filterIcon,
      optionSize,
      renderItem,
      optionsFilter,
      isMultiSelect,
      defaultSearchValue,
      ...props
    } = this.props
    const options = this.search(originalOptions)
    const listHeight = height - (hasFilter ? 32 : 0)

    return (
      <Pane
        height={height}
        width={width}
        display="flex"
        flexDirection="column"
        {...props}
      >
        {hasFilter && (
          <TableHead>
            <SearchTableHeaderCell
              onChange={this.handleChange}
              innerRef={this.assignSearchRef}
              borderRight={null}
              height={32}
              placeholder={filterPlaceholder}
              icon={filterIcon}
            />
          </TableHead>
        )}
        <Pane flex={1}>
          <VirtualList
            height={listHeight}
            width="100%"
            itemSize={optionSize}
            itemCount={options.length}
            overscanCount={20}
            scrollToAlignment="auto"
            {...(this.state.currentIndex
              ? {
                  scrollToIndex: this.state.currentIndex
                }
              : {})}
            renderItem={({ index, style }) => {
              const item = options[index]
              const isSelected = this.isSelected(item)
              return renderItem({
                key: item.value,
                label: item.label,
                style,
                height: optionSize,
                onSelect: () => this.handleSelect(item),
                onDeselect: () => this.handleDeselect(item),
                isSelectable: !isSelected || isMultiSelect,
                isSelected,
                disabled: item.disabled,
                isHighlighted: this.state.currentIndex === index
              })
            }}
          />
        </Pane>
      </Pane>
    )
  }
}
