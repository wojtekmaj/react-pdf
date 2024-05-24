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
import makeCancellable from 'make-cancellable-promise';
import invariant from 'tiny-invariant';
import warning from 'tiny-warning';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf';
import DocumentContext from '../DocumentContext';
import PageContext from '../PageContext';
import { cancelRunningTask } from '../shared/utils';
import { isLinkService, isPage, isRotate } from '../shared/propTypes';
export var AnnotationLayerInternal = /*#__PURE__*/function (_PureComponent) {
  _inherits(AnnotationLayerInternal, _PureComponent);

  var _super = _createSuper(AnnotationLayerInternal);

  function AnnotationLayerInternal() {
    var _this;

    _classCallCheck(this, AnnotationLayerInternal);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "state", {
      annotations: null
    });

    _defineProperty(_assertThisInitialized(_this), "layerElement", /*#__PURE__*/createRef());

    _defineProperty(_assertThisInitialized(_this), "loadAnnotations", function () {
      var page = _this.props.page;
      var cancellable = makeCancellable(page.getAnnotations());
      _this.runningTask = cancellable;
      cancellable.promise.then(function (annotations) {
        _this.setState({
          annotations: annotations
        }, _this.onLoadSuccess);
      })["catch"](function (error) {
        _this.onLoadError(error);
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onLoadSuccess", function () {
      var onGetAnnotationsSuccess = _this.props.onGetAnnotationsSuccess;
      var annotations = _this.state.annotations;
      if (onGetAnnotationsSuccess) onGetAnnotationsSuccess(annotations);
    });

    _defineProperty(_assertThisInitialized(_this), "onLoadError", function (error) {
      _this.setState({
        annotations: false
      });

      warning(error);
      var onGetAnnotationsError = _this.props.onGetAnnotationsError;
      if (onGetAnnotationsError) onGetAnnotationsError(error);
    });

    _defineProperty(_assertThisInitialized(_this), "onRenderSuccess", function () {
      var onRenderAnnotationLayerSuccess = _this.props.onRenderAnnotationLayerSuccess;
      if (onRenderAnnotationLayerSuccess) onRenderAnnotationLayerSuccess();
    });

    _defineProperty(_assertThisInitialized(_this), "onRenderError", function (error) {
      warning(error);
      var onRenderAnnotationLayerError = _this.props.onRenderAnnotationLayerError;
      if (onRenderAnnotationLayerError) onRenderAnnotationLayerError(error);
    });

    return _this;
  }

  _createClass(AnnotationLayerInternal, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var page = this.props.page;
      invariant(page, 'Attempted to load page annotations, but no page was specified.');
      this.loadAnnotations();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this$props = this.props,
          page = _this$props.page,
          renderForms = _this$props.renderForms;

      if (prevProps.page && page !== prevProps.page || renderForms !== prevProps.renderForms) {
        this.loadAnnotations();
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
      var _this$props2 = this.props,
          page = _this$props2.page,
          rotate = _this$props2.rotate,
          scale = _this$props2.scale;
      return page.getViewport({
        scale: scale,
        rotation: rotate
      });
    }
  }, {
    key: "renderAnnotationLayer",
    value: function renderAnnotationLayer() {
      var annotations = this.state.annotations;

      if (!annotations) {
        return;
      }

      var _this$props3 = this.props,
          imageResourcesPath = _this$props3.imageResourcesPath,
          linkService = _this$props3.linkService,
          page = _this$props3.page,
          renderForms = _this$props3.renderForms;
      var viewport = this.viewport.clone({
        dontFlip: true
      });
      var parameters = {
        annotations: annotations,
        div: this.layerElement.current,
        imageResourcesPath: imageResourcesPath,
        linkService: linkService,
        page: page,
        renderForms: renderForms,
        viewport: viewport
      };
      this.layerElement.current.innerHTML = '';

      try {
        pdfjs.AnnotationLayer.render(parameters);
        this.onRenderSuccess();
      } catch (error) {
        this.onRenderError(error);
      }
    }
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/React.createElement("div", {
        className: "react-pdf__Page__annotations annotationLayer",
        ref: this.layerElement
      }, this.renderAnnotationLayer());
    }
  }]);

  return AnnotationLayerInternal;
}(PureComponent);
AnnotationLayerInternal.propTypes = {
  imageResourcesPath: PropTypes.string,
  linkService: isLinkService.isRequired,
  onGetAnnotationsError: PropTypes.func,
  onGetAnnotationsSuccess: PropTypes.func,
  onRenderAnnotationLayerError: PropTypes.func,
  onRenderAnnotationLayerSuccess: PropTypes.func,
  page: isPage,
  renderForms: PropTypes.bool,
  rotate: isRotate,
  scale: PropTypes.number
};

var AnnotationLayer = function AnnotationLayer(props) {
  return /*#__PURE__*/React.createElement(DocumentContext.Consumer, null, function (documentContext) {
    return /*#__PURE__*/React.createElement(PageContext.Consumer, null, function (pageContext) {
      return /*#__PURE__*/React.createElement(AnnotationLayerInternal, _extends({}, documentContext, pageContext, props));
    });
  });
};

export default AnnotationLayer;