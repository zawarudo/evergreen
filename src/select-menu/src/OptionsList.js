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
const fuzzyFilter = (options, input) => fuzzaldrin.filter(options, input)

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
     * This holds the values of the options
     */
    selected: PropTypes.arrayOf(PropTypes.string),
    onSelect: PropTypes.func,
    onDeselect: PropTypes.func,
    onFilterChange: PropTypes.func,
    hasFilter: PropTypes.bool,
    optionSize: PropTypes.number,
    renderItem: PropTypes.func,
    placeholder: PropTypes.string,
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
    optionsFilter: fuzzyFilter,
    placeholder: 'Filter...',
    defaultSearchValue: ''
  }

  constructor(props, context) {
    super(props, context)

    this.state = {
      searchValue: props.defaultSearchValue,
      selected: props.selected,
      currentIndex: -1
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

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selected: this.props.selected
      })
    }
  }

  isSelected = item => {
    const { selected } = this.state

    return Boolean(selected.find(selectedItem => selectedItem === item.value))
  }

  search = options => {
    const { optionsFilter } = this.props
    const { searchValue } = this.state

    return searchValue.trim() === ''
      ? options // Return if no search query
      : optionsFilter(
          options.map(item => item.labelInList || item.label),
          searchValue
        ).map(name =>
          options.find(item => item.labelInList === name || item.label === name)
        )
  }

  getCurrentIndex = () => {
    const { selected } = this.props
    const options = this.getFilteredOptions()

    return options.findIndex(
      option => option.value === selected[selected.length - 1]
    )
  }

  getFilteredOptions() {
    const { options } = this.props

    return this.search(options)
  }

  handleKeyDown = e => {
    if (e.keyCode === 38) {
      this.handleArrowUp()
    }

    if (e.keyCode === 40) {
      this.handleArrowDown()
    }

    if (e.keyCode === 13) {
      this.handleEnter()
    }
  }

  handleArrowUp = () => {
    const options = this.getFilteredOptions()
    this.setState(prevState => {
      let nextIndex = prevState.currentIndex - 1
      if (nextIndex < 0) {
        nextIndex = options.length - 1
      }
      return { currentIndex: nextIndex }
    })
  }

  handleArrowDown = () => {
    const options = this.getFilteredOptions()
    this.setState(prevState => {
      let nextIndex = prevState.currentIndex + 1
      if (nextIndex === options.length) {
        nextIndex = 0
      }
      return { currentIndex: nextIndex }
    })
  }

  handleEnter = () => {
    const { onSelect, onDeselect } = this.props
    const { currentIndex } = this.state
    const options = this.getFilteredOptions()
    const item = options[currentIndex]
    if (this.isSelected(item)) {
      onDeselect(item)
    } else {
      onSelect(item)
    }
  }

  handleChange = searchValue => {
    this.setState({
      searchValue
    })
    this.props.onFilterChange(searchValue)
  }

  setCurrentIndex = item => {
    const options = this.getFilteredOptions()
    const newIndex = options.findIndex(option => option === item)
    this.setState({ currentIndex: newIndex })
  }

  handleSelect = item => {
    this.setCurrentIndex(item)
    this.props.onSelect(item)
  }

  handleDeselect = item => {
    this.setCurrentIndex(item)
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
      optionSize,
      renderItem,
      placeholder,
      optionsFilter,
      isMultiSelect,
      defaultSearchValue,
      ...props
    } = this.props
    const { currentIndex } = this.state
    const options = this.search(originalOptions)
    const listHeight = height - (hasFilter ? 32 : 0)
    const scrollToIndex = currentIndex === -1 ? 0 : currentIndex

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
            {...(scrollToIndex
              ? {
                  scrollToIndex
                }
              : {})}
            renderItem={({ index, style }) => {
              const item = options[index]
              const isSelected = this.isSelected(item)
              return renderItem({
                isHighlighted: index === currentIndex,
                key: item.value,
                label: item.label,
                style,
                height: optionSize,
                onSelect: () => this.handleSelect(item),
                onDeselect: () => this.handleDeselect(item),
                isSelectable: !isSelected || isMultiSelect,
                isSelected,
                disabled: item.disabled
              })
            }}
          />
        </Pane>
      </Pane>
    )
  }
}
