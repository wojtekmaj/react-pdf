import _extends from "@babel/runtime/helpers/esm/extends";
import _classCallCheck from "@babel/runtime/helpers/esm/classCallCheck";
import _createClass from "@babel/runtime/helpers/esm/createClass";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inherits from "@babel/runtime/helpers/esm/inherits";
import _possibleConstructorReturn from "@babel/runtime/helpers/esm/possibleConstructorReturn";
import _getPrototypeOf from "@babel/runtime/helpers/esm/getPrototypeOf";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

import React, { createRef, PureComponent } from 'react';
import PropTypes from 'prop-types';
import mergeRefs from 'merge-refs';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import PageContext from '../PageContext';
import { getPixelRatio, isCancelException, makePageCallback } from '../shared/utils';
import { isPage, isRef, isRotate } from '../shared/propTypes';
var ANNOTATION_MODE = pdfjs.AnnotationMode;
export var PageCanvasInternal = /*#__PURE__*/function (_PureComponent) {
  _inherits(PageCanvasInternal, _PureComponent);

  var _super = _createSuper(PageCanvasInternal);

  function PageCanvasInternal() {
    var _this;

    _classCallCheck(this, PageCanvasInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "canvasElement", /*#__PURE__*/createRef());

    _defineProperty(_assertThisInitialized(_this), "onRenderSuccess", function () {
      _this.renderer = null;
      var _this$props = _this.props,
          onRenderSuccess = _this$props.onRenderSuccess,
          page = _this$props.page,
          scale = _this$props.scale;
      if (onRenderSuccess) onRenderSuccess(makePageCallback(page, scale));
    });

    _defineProperty(_assertThisInitialized(_this), "onRenderError", function (error) {
      if (isCancelException(error)) {
        return;
      }

      warning(error);
      var onRenderError = _this.props.onRenderError;
      if (onRenderError) onRenderError(error);
    });

    _defineProperty(_assertThisInitialized(_this), "drawPageOnCanvas", function () {
      var canvas = _this.canvasElement.current;

      if (!canvas) {
        return null;
      }

      var _assertThisInitialize = _assertThisInitialized(_this),
          renderViewport = _assertThisInitialize.renderViewport,
          viewport = _assertThisInitialize.viewport;

      var _this$props2 = _this.props,
          canvasBackground = _this$props2.canvasBackground,
          page = _this$props2.page,
          renderForms = _this$props2.renderForms;
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;
      canvas.style.width = "".concat(Math.floor(viewport.width), "px");
      canvas.style.height = "".concat(Math.floor(viewport.height), "px");
      var renderContext = {
        annotationMode: renderForms ? ANNOTATION_MODE.ENABLE_FORMS : ANNOTATION_MODE.ENABLE,

        get canvasContext() {
          return canvas.getContext('2d');
        },

        viewport: renderViewport
      };

      if (canvasBackground) {
        renderContext.background = canvasBackground;
      } // If another render is in progress, let's cancel it


      _this.cancelRenderingTask();

      _this.renderer = page.render(renderContext);
      return _this.renderer.promise.then(_this.onRenderSuccess)["catch"](_this.onRenderError);
    });

    return _this;
  }

  _createClass(PageCanvasInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this.drawPageOnCanvas();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this$props3 = this.props,
          canvasBackground = _this$props3.canvasBackground,
          page = _this$props3.page,
          renderForms = _this$props3.renderForms;

      if (canvasBackground !== prevProps.canvasBackground || renderForms !== prevProps.renderForms) {
        // Ensures the canvas will be re-rendered from scratch. Otherwise all form data will stay.
        page.cleanup();
        this.drawPageOnCanvas();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.cancelRenderingTask();
      var canvas = this.canvasElement.current;
      /**
       * Zeroing the width and height cause most browsers to release graphics
       * resources immediately, which can greatly reduce memory consumption.
       */

      if (canvas) {
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  }, {
    key: "cancelRenderingTask",
    value: function cancelRenderingTask() {
      if (this.renderer) {
        this.renderer.cancel();
        this.renderer = null;
      }
    }
    /**
     * Called when a page is rendered successfully.
     */

  }, {
    key: "renderViewport",
    get: function get() {
      var _this$props4 = this.props,
          page = _this$props4.page,
          rotate = _this$props4.rotate,
          scale = _this$props4.scale;
      var pixelRatio = getPixelRatio();
      return page.getViewport({
        scale: scale * pixelRatio,
        rotation: rotate
      });
    }
  }, {
    key: "viewport",
    get: function get() {
      var _this$props5 = this.props,
          page = _this$props5.page,
          rotate = _this$props5.rotate,
          scale = _this$props5.scale;
      return page.getViewport({
        scale: scale,
        rotation: rotate
      });
    }
  }, {
    key: "render",
    value: function render() {
      var canvasRef = this.props.canvasRef;
      return /*#__PURE__*/React.createElement("canvas", {
        className: "react-pdf__Page__canvas",
        dir: "ltr",
        ref: mergeRefs(canvasRef, this.canvasElement),
        style: {
          display: 'block',
          userSelect: 'none'
        }
      });
    }
  }]);

  return PageCanvasInternal;
}(PureComponent);
PageCanvasInternal.propTypes = {
  canvasBackground: PropTypes.string,
  canvasRef: isRef,
  onRenderError: PropTypes.func,
  onRenderSuccess: PropTypes.func,
  page: isPage.isRequired,
  renderForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number.isRequired
};
export default function PageCanvas(props) {
  return /*#__PURE__*/React.createElement(PageContext.Consumer, null, function (context) {
    return /*#__PURE__*/React.createElement(PageCanvasInternal, _extends({}, context, props));
  });
}