import _extends from "@babel/runtime/helpers/esm/extends";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import DocumentContext from './DocumentContext';
import OutlineContext from './OutlineContext';
import OutlineItem from './OutlineItem';
import { cancelRunningTask } from './shared/utils';
import { eventProps, isClassName, isPdf, isRef } from './shared/propTypes';
export var OutlineInternal = /*#__PURE__*/function (_PureComponent) {
  _inherits(OutlineInternal, _PureComponent);

  var _super = _createSuper(OutlineInternal);

  function OutlineInternal() {
    var _this;

    _classCallCheck(this, OutlineInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      outline: null
    });

    _defineProperty(_assertThisInitialized(_this), "loadOutline", function () {
      var pdf = _this.props.pdf;

      _this.setState(function (prevState) {
        if (!prevState.outline) {
          return null;
        }

        return {
          outline: null
        };
      });

      var cancellable = makeCancellable(pdf.getOutline());
      _this.runningTask = cancellable;
      cancellable.promise.then(function (outline) {
        _this.setState({
          outline: outline
        }, _this.onLoadSuccess);
      })["catch"](function (error) {
        _this.onLoadError(error);
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onLoadSuccess", function () {
      var onLoadSuccess = _this.props.onLoadSuccess;
      var outline = _this.state.outline;
      if (onLoadSuccess) onLoadSuccess(outline);
    });

    _defineProperty(_assertThisInitialized(_this), "onLoadError", function (error) {
      _this.setState({
        outline: false
      });

      warning(error);
      var onLoadError = _this.props.onLoadError;
      if (onLoadError) onLoadError(error);
    });

    _defineProperty(_assertThisInitialized(_this), "onItemClick", function (_ref) {
      var dest = _ref.dest,
          pageIndex = _ref.pageIndex,
          pageNumber = _ref.pageNumber;
      var onItemClick = _this.props.onItemClick;

      if (onItemClick) {
        onItemClick({
          dest: dest,
          pageIndex: pageIndex,
          pageNumber: pageNumber
        });
      }
    });

    return _this;
  }

  _createClass(OutlineInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var pdf = this.props.pdf;
      invariant(pdf, 'Attempted to load an outline, but no document was specified.');
      this.loadOutline();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var pdf = this.props.pdf;

      if (prevProps.pdf && pdf !== prevProps.pdf) {
        this.loadOutline();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      cancelRunningTask(this.runningTask);
    }
  }, {
    key: "childContext",
    get: function get() {
      return {
        onClick: this.onItemClick
      };
    }
  }, {
    key: "eventProps",
    get: function get() {
      var _this2 = this;

      return makeEventProps(this.props, function () {
        return _this2.state.outline;
      });
    }
    /**
     * Called when an outline is read successfully
     */

  }, {
    key: "renderOutline",
    value: function renderOutline() {
      var outline = this.state.outline;
      return /*#__PURE__*/React.createElement("ul", null, outline.map(function (item, itemIndex) {
        return /*#__PURE__*/React.createElement(OutlineItem, {
          key: typeof item.destination === 'string' ? item.destination : itemIndex,
          item: item
        });
      }));
    }
  }, {
    key: "render",
    value: function render() {
      var pdf = this.props.pdf;
      var outline = this.state.outline;

      if (!pdf || !outline) {
        return null;
      }

      var _this$props = this.props,
          className = _this$props.className,
          inputRef = _this$props.inputRef;
      return /*#__PURE__*/React.createElement("div", _extends({
        className: mergeClassNames('react-pdf__Outline', className),
        ref: inputRef
      }, this.eventProps), /*#__PURE__*/React.createElement(OutlineContext.Provider, {
        value: this.childContext
      }, this.renderOutline()));
    }
  }]);

  return OutlineInternal;
}(PureComponent);
OutlineInternal.propTypes = _objectSpread({
  className: isClassName,
  inputRef: isRef,
  onItemClick: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  pdf: isPdf
}, eventProps);

function Outline(props, ref) {
  return /*#__PURE__*/React.createElement(DocumentContext.Consumer, null, function (context) {
    return /*#__PURE__*/React.createElement(OutlineInternal, _extends({
      ref: ref
    }, context, props));
  });
}

export default /*#__PURE__*/React.forwardRef(Outline);