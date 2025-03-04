import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Field } from 'mobx-react-form';
import classnames from 'classnames';
import Dropzone from 'react-dropzone';
import { isWindows } from '../../environment';

@observer
class ImageUpload extends Component {
  static propTypes = {
    field: PropTypes.instanceOf(Field).isRequired,
    className: PropTypes.string,
    multiple: PropTypes.bool,
    textDelete: PropTypes.string.isRequired,
    textUpload: PropTypes.string.isRequired,
  };

  static defaultProps = {
    className: null,
    multiple: false,
  };

  state = {
    path: null,
  };

  dropzoneRef = null;

  onDrop(acceptedFiles) {
    const { field } = this.props;

    for (const file of acceptedFiles) {
      const imgPath = isWindows ? file.path.replace(/\\/g, '/') : file.path;
      this.setState({
        path: imgPath,
      });

      this.props.field.onDrop(file);
    }

    field.set('');
  }

  render() {
    const { field, className, multiple, textDelete, textUpload } = this.props;

    const cssClasses = classnames({
      'image-upload__dropzone': true,
      [`${className}`]: className,
    });

    return (
      <div className="image-upload-wrapper">
        <label className="franz-form__label" htmlFor="iconUpload">
          {field.label}
        </label>
        <div className="image-upload">
          {(field.value && field.value !== 'delete') || this.state.path ? (
            <>
              <div
                className="image-upload__preview"
                style={{
                  backgroundImage: `url("${this.state.path || field.value}")`,
                }}
              />
              <div className="image-upload__action">
                <button
                  type="button"
                  onClick={() => {
                    if (field.value) {
                      field.set('delete');
                    } else {
                      this.setState({
                        path: null,
                      });
                    }
                  }}
                >
                  <i className="mdi mdi-delete" />
                  <p>{textDelete}</p>
                </button>
                <div className="image-upload__action-background" />
              </div>
            </>
          ) : (
            <Dropzone
              ref={node => {
                this.dropzoneRef = node;
              }}
              onDrop={this.onDrop.bind(this)}
              multiple={multiple}
              accept="image/jpeg, image/png, image/svg+xml"
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} className={cssClasses}>
                  <i className="mdi mdi-file-image" />
                  <p>{textUpload}</p>
                  <input {...getInputProps()} />
                </div>
              )}
            </Dropzone>
          )}
        </div>
      </div>
    );
  }
}

export default ImageUpload;
