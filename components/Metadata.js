import React from 'react';
import Collapsible from 'react-collapsible';

const Type = require('geppetto-client/js/geppettoModel/model/Type');

export default class Metadata extends React.Component {

  state = { content: [] }

  prettyFormat (string) {
    let output = string.charAt(0).toUpperCase() + string.slice(1);
    return output.replace('_interface_map', '').replace('_', ' ')
  }

  getContent (geppettoInstanceOrType) {

    let metadata;
    const content = [];

    if (!geppettoInstanceOrType) {
      return;
    }
   
    const type = (geppettoInstanceOrType instanceof Type) ? geppettoInstanceOrType : geppettoInstanceOrType.getType();
    if (this.props.showObjectInfo){
      content.push(
        this.formatCollapsible('Info', 
          [
            this.formatField('Path', type.getId()),
            this.formatField('Type', type.getName()),
          ])
      );
    }
      
    type.getChildren().forEach(variable => {
      const variableType = variable.getType().getName();
      let name = variable.getId();
      const { prettyFormat } = this;

      if (variableType == 'Text' ) {
        let value = variable.getInitialValue().value.text;
        metadata = value;
      
      } else if (variableType == 'map' ) {
        metadata = variable.getType().getChildren().map(v => {
          if (v.getType().getName() == 'Text') {
            let name = v.getId();
            let value = v.getInitialValue().value.text;
            return this.formatField(prettyFormat(name), value);
          }
        });
      }

      if (metadata) {
        content.push(
          this.formatCollapsible(name, metadata)
        );
      }
      
    });

    return content;

  }

  formatCollapsible (name, metadata) {
    const { prettyFormat } = this;
    return <Collapsible open={true} trigger={prettyFormat(name)}>
      <div>{metadata}</div>
    </Collapsible>;
  }

  formatField (name, value) {
    return <p key={name}><span className="meta-label">{name}</span>: {value}</p>;
  }

  shouldComponentUpdate (prevProps) {
    return this.props.instancePath != prevProps.instancePath;
  }


  render () {
    const instance = Instances.getInstance(this.props.instancePath);
    const content = this.getContent(instance);
    return (
      <div style={{ marginBottom:'1em' }}>
        
        {
          content.map((item, key) => 
            <div key={key}>
              {item}
            </div>
          )
        }
      </div>
    );
  }
}