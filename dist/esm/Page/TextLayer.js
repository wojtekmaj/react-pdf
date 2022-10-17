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
import React, { createRef, PureComponent } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import PageContext from '../PageContext';
import { cancelRunningTask } from '../shared/utils';
import { isPage, isRotate } from '../shared/propTypes';
export var TextLayerInternal = /*#__PURE__*/function (_PureComponent) {
  _inherits(TextLayerInternal, _PureComponent);
  var _super = _createSuper(TextLayerInternal);
  function TextLayerInternal() {
    var _this;
    _classCallCheck(this, TextLayerInternal);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _super.call.apply(_super, [this].concat(args));
    _defineProperty(_assertThisInitialized(_this), "state", {
      textContent: null
    });
    _defineProperty(_assertThisInitialized(_this), "layerElement", /*#__PURE__*/createRef());
    _defineProperty(_assertThisInitialized(_this), "loadTextContent", function () {
      var page = _this.props.page;
      var cancellable = makeCancellable(page.getTextContent());
      _this.runningTask = cancellable;
      cancellable.promise.then(function (textContent) {
        _this.setState({
          textContent: textContent
        }, _this.onLoadSuccess);
      })["catch"](function (error) {
        _this.onLoadError(error);
      });
    });
    _defineProperty(_assertThisInitialized(_this), "onLoadSuccess", function () {
      var onGetTextSuccess = _this.props.onGetTextSuccess;
      var textContent = _this.state.textContent;
      if (onGetTextSuccess) onGetTextSuccess(textContent);
    });
    _defineProperty(_assertThisInitialized(_this), "onLoadError", function (error) {
      _this.setState({
        textItems: false
      });
      warning(error);
      var onGetTextError = _this.props.onGetTextError;
      if (onGetTextError) onGetTextError(error);
    });
    _defineProperty(_assertThisInitialized(_this), "onRenderSuccess", function () {
      var onRenderTextLayerSuccess = _this.props.onRenderTextLayerSuccess;
      if (onRenderTextLayerSuccess) onRenderTextLayerSuccess();
    });
    _defineProperty(_assertThisInitialized(_this), "onRenderError", function (error) {
      warning(error);
      var onRenderTextLayerError = _this.props.onRenderTextLayerError;
      if (onRenderTextLayerError) onRenderTextLayerError(error);
    });
    return _this;
  }
  _createClass(TextLayerInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var page = this.props.page;
      invariant(page, 'Attempted to load page text content, but no page was specified.');
      warning(parseInt(window.getComputedStyle(document.body).getPropertyValue('--react-pdf-text-layer'), 10) === 1, 'TextLayer styles not found. Read more: https://github.com/wojtekmaj/react-pdf#support-for-text-layer');
      this.loadTextContent();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var page = this.props.page;
      if (prevProps.page && page !== prevProps.page) {
        this.loadTextContent();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      cancelRunningTask(this.runningTask);
    }
  }, {
    key: "viewport",
    get: function get() {
      var _this$props = this.props,
        page = _this$props.page,
        rotate = _this$props.rotate,
        scale = _this$props.scale;
      return page.getViewport({
        scale: scale,
        rotation: rotate
      });
    }
  }, {
    key: "unrotatedViewport",
    get: function get() {
      var _this$props2 = this.props,
        page = _this$props2.page,
        scale = _this$props2.scale;
      return page.getViewport({
        scale: scale
      });
    }

    /**
     * It might happen that the page is rotated by default. In such cases, we shouldn't rotate
     * text content.
     */
  }, {
    key: "rotate",
    get: function get() {
      var _this$props3 = this.props,
        page = _this$props3.page,
        rotate = _this$props3.rotate;
      return rotate - page.rotate;
    }
  }, {
    key: "renderTextLayer",
    value: function renderTextLayer() {
      var _this2 = this;
      var textContent = this.state.textContent;
      if (!textContent) {
        return null;
      }
      var viewport = this.viewport;
      var customTextRenderer = this.props.customTextRenderer;

      // If another rendering is in progress, let's cancel it
      cancelRunningTask(this.runningTask);
      var parameters = {
        container: this.layerElement.current,
        textContent: textContent,
        viewport: viewport
      };
      this.layerElement.current.innerHTML = '';
      this.runningTask = pdfjs.renderTextLayer(parameters);
      var cancellable = makeCancellable(this.runningTask.promise);
      this.runningTask = cancellable;
      cancellable.promise.then(function () {
        if (customTextRenderer) {
          Array.from(_this2.layerElement.current.children).forEach(function (element, elementIndex) {
            var reactContent = customTextRenderer(_objectSpread({
              itemIndex: elementIndex
            }, textContent.items[elementIndex]));
            element.innerHTML = renderToStaticMarkup(reactContent);
          });
        }
        _this2.onRenderSuccess();
      })["catch"](function (error) {
        _this2.onRenderError(error);
      });
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("div", {
        className: "react-pdf__Page__textContent textLayer",
        ref: this.layerElement
      }, this.renderTextLayer());
    }
  }]);
  return TextLayerInternal;
}(PureComponent);
TextLayerInternal.propTypes = {
  customTextRenderer: PropTypes.func,
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onRenderTextLayerError: PropTypes.func,
  onRenderTextLayerSuccess: PropTypes.func,
  page: isPage.isRequired,
  rotate: isRotate,
  scale: PropTypes.number
};
export default function TextLayer(props) {
  return /*#__PURE__*/React.createElement(PageContext.Consumer, null, function (context) {
    return /*#__PURE__*/React.createElement(TextLayerInternal, _extends({}, context, props));
  });
}