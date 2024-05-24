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
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';
import makeEventProps from 'make-event-props';
import mergeClassNames from 'merge-class-names';
import mergeRefs from 'merge-refs';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import DocumentContext from './DocumentContext';
import PageContext from './PageContext';
import Message from './Message';
import PageCanvas from './Page/PageCanvas';
import PageSVG from './Page/PageSVG';
import TextLayer from './Page/TextLayer';
import AnnotationLayer from './Page/AnnotationLayer';
import { cancelRunningTask, isProvided, makePageCallback } from './shared/utils';
import { eventProps, isClassName, isPageIndex, isPageNumber, isPdf, isRef, isRenderMode, isRotate } from './shared/propTypes';
var defaultScale = 1;
export var PageInternal = /*#__PURE__*/function (_PureComponent) {
  _inherits(PageInternal, _PureComponent);

  var _super = _createSuper(PageInternal);

  function PageInternal() {
    var _this;

    _classCallCheck(this, PageInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      page: null
    });

    _defineProperty(_assertThisInitialized(_this), "pageElement", /*#__PURE__*/createRef());

    _defineProperty(_assertThisInitialized(_this), "onLoadSuccess", function () {
      var _this$props = _this.props,
          onLoadSuccess = _this$props.onLoadSuccess,
          registerPage = _this$props.registerPage;
      var page = _this.state.page;
      if (onLoadSuccess) onLoadSuccess(makePageCallback(page, _this.scale));
      if (registerPage) registerPage(_this.pageIndex, _this.pageElement.current);
    });

    _defineProperty(_assertThisInitialized(_this), "onLoadError", function (error) {
      _this.setState({
        page: false
      });

      warning(error);
      var onLoadError = _this.props.onLoadError;
      if (onLoadError) onLoadError(error);
    });

    _defineProperty(_assertThisInitialized(_this), "loadPage", function () {
      var pdf = _this.props.pdf;

      var pageNumber = _this.getPageNumber();

      if (!pageNumber) {
        return;
      }

      _this.setState(function (prevState) {
        if (!prevState.page) {
          return null;
        }

        return {
          page: null
        };
      });

      var cancellable = makeCancellable(pdf.getPage(pageNumber));
      _this.runningTask = cancellable;
      cancellable.promise.then(function (page) {
        _this.setState({
          page: page
        }, _this.onLoadSuccess);
      })["catch"](function (error) {
        _this.onLoadError(error);
      });
    });

    return _this;
  }

  _createClass(PageInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var pdf = this.props.pdf;
      invariant(pdf, 'Attempted to load a page, but no document was specified.');
      this.loadPage();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var pdf = this.props.pdf;

      if (prevProps.pdf && pdf !== prevProps.pdf || this.getPageNumber() !== this.getPageNumber(prevProps)) {
        var unregisterPage = this.props.unregisterPage;
        if (unregisterPage) unregisterPage(this.getPageIndex(prevProps));
        this.loadPage();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var unregisterPage = this.props.unregisterPage;
      if (unregisterPage) unregisterPage(this.pageIndex);
      cancelRunningTask(this.runningTask);
    }
  }, {
    key: "childContext",
    get: function get() {
      var page = this.state.page;

      if (!page) {
        return {};
      }

      var _this$props2 = this.props,
          canvasBackground = _this$props2.canvasBackground,
          customTextRenderer = _this$props2.customTextRenderer,
          onGetAnnotationsError = _this$props2.onGetAnnotationsError,
          onGetAnnotationsSuccess = _this$props2.onGetAnnotationsSuccess,
          onGetTextError = _this$props2.onGetTextError,
          onGetTextSuccess = _this$props2.onGetTextSuccess,
          onRenderAnnotationLayerError = _this$props2.onRenderAnnotationLayerError,
          onRenderAnnotationLayerSuccess = _this$props2.onRenderAnnotationLayerSuccess,
          onRenderError = _this$props2.onRenderError,
          onRenderSuccess = _this$props2.onRenderSuccess,
          renderForms = _this$props2.renderForms,
          renderInteractiveForms = _this$props2.renderInteractiveForms;
      return {
        canvasBackground: canvasBackground,
        customTextRenderer: customTextRenderer,
        onGetAnnotationsError: onGetAnnotationsError,
        onGetAnnotationsSuccess: onGetAnnotationsSuccess,
        onGetTextError: onGetTextError,
        onGetTextSuccess: onGetTextSuccess,
        onRenderAnnotationLayerError: onRenderAnnotationLayerError,
        onRenderAnnotationLayerSuccess: onRenderAnnotationLayerSuccess,
        onRenderError: onRenderError,
        onRenderSuccess: onRenderSuccess,
        page: page,
        renderForms: renderForms !== null && renderForms !== void 0 ? renderForms : renderInteractiveForms,
        // For backward compatibility
        rotate: this.rotate,
        scale: this.scale
      };
    }
    /**
     * Called when a page is loaded successfully
     */

  }, {
    key: "getPageIndex",
    value: function getPageIndex() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      if (isProvided(props.pageNumber)) {
        return props.pageNumber - 1;
      }

      if (isProvided(props.pageIndex)) {
        return props.pageIndex;
      }

      return null;
    }
  }, {
    key: "getPageNumber",
    value: function getPageNumber() {
      var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.props;

      if (isProvided(props.pageNumber)) {
        return props.pageNumber;
      }

      if (isProvided(props.pageIndex)) {
        return props.pageIndex + 1;
      }

      return null;
    }
  }, {
    key: "pageIndex",
    get: function get() {
      return this.getPageIndex();
    }
  }, {
    key: "pageNumber",
    get: function get() {
      return this.getPageNumber();
    }
  }, {
    key: "rotate",
    get: function get() {
      var rotate = this.props.rotate;

      if (isProvided(rotate)) {
        return rotate;
      }

      var page = this.state.page;

      if (!page) {
        return null;
      }

      return page.rotate;
    }
  }, {
    key: "scale",
    get: function get() {
      var page = this.state.page;

      if (!page) {
        return null;
      }

      var _this$props3 = this.props,
          scale = _this$props3.scale,
          width = _this$props3.width,
          height = _this$props3.height;
      var rotate = this.rotate; // Be default, we'll render page at 100% * scale width.

      var pageScale = 1; // Passing scale explicitly null would cause the page not to render

      var scaleWithDefault = scale === null ? defaultScale : scale; // If width/height is defined, calculate the scale of the page so it could be of desired width.

      if (width || height) {
        var viewport = page.getViewport({
          scale: 1,
          rotation: rotate
        });
        pageScale = width ? width / viewport.width : height / viewport.height;
      }

      return scaleWithDefault * pageScale;
    }
  }, {
    key: "eventProps",
    get: function get() {
      var _this2 = this;

      return makeEventProps(this.props, function () {
        var page = _this2.state.page;

        if (!page) {
          return page;
        }

        return makePageCallback(page, _this2.scale);
      });
    }
  }, {
    key: "pageKey",
    get: function get() {
      var page = this.state.page;
      return "".concat(page.pageIndex, "@").concat(this.scale, "/").concat(this.rotate);
    }
  }, {
    key: "pageKeyNoScale",
    get: function get() {
      var page = this.state.page;
      return "".concat(page.pageIndex, "/").concat(this.rotate);
    }
  }, {
    key: "renderMainLayer",
    value: function renderMainLayer() {
      var _this$props4 = this.props,
          canvasRef = _this$props4.canvasRef,
          renderMode = _this$props4.renderMode;

      switch (renderMode) {
        case 'none':
          return null;

        case 'svg':
          return /*#__PURE__*/React.createElement(PageSVG, {
            key: "".concat(this.pageKeyNoScale, "_svg")
          });

        case 'canvas':
        default:
          return /*#__PURE__*/React.createElement(PageCanvas, {
            key: "".concat(this.pageKey, "_canvas"),
            canvasRef: canvasRef
          });
      }
    }
  }, {
    key: "renderTextLayer",
    value: function renderTextLayer() {
      var renderTextLayer = this.props.renderTextLayer;

      if (!renderTextLayer) {
        return null;
      }

      return /*#__PURE__*/React.createElement(TextLayer, {
        key: "".concat(this.pageKey, "_text")
      });
    }
  }, {
    key: "renderAnnotationLayer",
    value: function renderAnnotationLayer() {
      var renderAnnotationLayer = this.props.renderAnnotationLayer;

      if (!renderAnnotationLayer) {
        return null;
      }
      /**
       * As of now, PDF.js 2.0.943 returns warnings on unimplemented annotations in SVG mode.
       * Therefore, as a fallback, we render "traditional" AnnotationLayer component.
       */


      return /*#__PURE__*/React.createElement(AnnotationLayer, {
        key: "".concat(this.pageKey, "_annotations")
      });
    }
  }, {
    key: "renderChildren",
    value: function renderChildren() {
      var children = this.props.children;
      return /*#__PURE__*/React.createElement(PageContext.Provider, {
        value: this.childContext
      }, this.renderMainLayer(), this.renderTextLayer(), this.renderAnnotationLayer(), children);
    }
  }, {
    key: "renderContent",
    value: function renderContent() {
      var pageNumber = this.pageNumber;
      var pdf = this.props.pdf;
      var page = this.state.page;

      if (!pageNumber) {
        var noData = this.props.noData;
        return /*#__PURE__*/React.createElement(Message, {
          type: "no-data"
        }, typeof noData === 'function' ? noData() : noData);
      }

      if (pdf === null || page === null) {
        var loading = this.props.loading;
        return /*#__PURE__*/React.createElement(Message, {
          type: "loading"
        }, typeof loading === 'function' ? loading() : loading);
      }

      if (pdf === false || page === false) {
        var error = this.props.error;
        return /*#__PURE__*/React.createElement(Message, {
          type: "error"
        }, typeof error === 'function' ? error() : error);
      }

      return this.renderChildren();
    }
  }, {
    key: "render",
    value: function render() {
      var pageNumber = this.pageNumber;
      var _this$props5 = this.props,
          className = _this$props5.className,
          inputRef = _this$props5.inputRef;
      return /*#__PURE__*/React.createElement("div", _extends({
        className: mergeClassNames('react-pdf__Page', className),
        "data-page-number": pageNumber,
        ref: mergeRefs(inputRef, this.pageElement),
        style: {
          position: 'relative'
        }
      }, this.eventProps), this.renderContent());
    }
  }]);

  return PageInternal;
}(PureComponent);
PageInternal.defaultProps = {
  error: 'Failed to load the page.',
  loading: 'Loading page…',
  noData: 'No page specified.',
  renderAnnotationLayer: true,
  renderForms: false,
  renderMode: 'canvas',
  renderTextLayer: true,
  scale: defaultScale
};
var isFunctionOrNode = PropTypes.oneOfType([PropTypes.func, PropTypes.node]);
PageInternal.propTypes = _objectSpread(_objectSpread({}, eventProps), {}, {
  canvasBackground: PropTypes.string,
  children: PropTypes.node,
  className: isClassName,
  customTextRenderer: PropTypes.func,
  error: isFunctionOrNode,
  height: PropTypes.number,
  imageResourcesPath: PropTypes.string,
  inputRef: isRef,
  loading: isFunctionOrNode,
  noData: isFunctionOrNode,
  onGetTextError: PropTypes.func,
  onGetTextSuccess: PropTypes.func,
  onLoadError: PropTypes.func,
  onLoadSuccess: PropTypes.func,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  pageIndex: isPageIndex,
  pageNumber: isPageNumber,
  pdf: isPdf,
  registerPage: PropTypes.func,
  renderAnnotationLayer: PropTypes.bool,
  renderForms: PropTypes.bool,
  renderInteractiveForms: PropTypes.bool,
  // For backward compatibility
  renderMode: isRenderMode,
  renderTextLayer: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number,
  unregisterPage: PropTypes.func,
  width: PropTypes.number
});

function Page(props, ref) {
  return /*#__PURE__*/React.createElement(DocumentContext.Consumer, null, function (context) {
    return /*#__PURE__*/React.createElement(PageInternal, _extends({
      ref: ref
    }, context, props));
  });
}

export default /*#__PURE__*/React.forwardRef(Page);