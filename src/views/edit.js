/* globals UI */

var C = UI.Views.Connector;

class EditForm extends C.View {
  constructor(props) {
    super(props);
    this.state = {
      events: []
    };
    if (!props.connector) {
      this.state.mode = 'connect';
    }
  }
  componentDidMount() {
    //Find a better way to do this, but set the checkbox as false first up
    this.props.updateField({target: {
      name: 'isSandbox',
      checked: false,
      type: 'checkbox'
    }});
  }
  render() {
    return (
      <C.Page default="setup" {...this.props}>
        <C.Panel name="Setup" slug="setup">
          <C.Column type="notes">
            <h1>Adding a Quickbooks Online Connector</h1>
            <ol>
              <li>Log in to <a href="https://developer.intuit.com/">https://developer.intuit.com/</a></li>
              <li>Click the <strong>'My Apps'</strong> tab</li>
              <li>Click the <strong>'Create new app'</strong> button</li>
              <li>Select the APIs you want to access</li>
              <li>Click on the <strong>'Keys tab'</strong></li>
              <li>Copy the <strong>'OAuth Consumer Key'</strong> and <strong>'OAuth Consumer Secret'</strong> into the boxes on this page.</li>
              <li>Click <strong>'Save and Verify'</strong></li>
            </ol>
          </C.Column>
          <C.Column>
            <form onChange={(evt) => {
              this.props.updateField(evt);
            }} onSubmit={(evt) => {
              this.props.updateSettings(evt);
            }}>
              <UI.FormElements.Input inactive={!!(this.props.connectorInstance)} placeholder="Key" name="key" label="Key" type="text" value={this.props._key}/>
              <UI.FormElements.Input placeholder="Consumer Token" name="consumerKey" label="Consumer Token" type="text" value={this.props.settings.consumerKey}/>
              <UI.FormElements.Input placeholder="Consumer Secret" name="consumerSecret" label="Consumer Secret" type="text" value={this.props.settings.consumerSecret}/>
              <UI.FormElements.Checkbox placeholder="Use Sandbox" name="isSandbox" label="Use Sandbox" type="checkbox" value={this.props.settings.isSandbox}/>
              <UI.FormElements.Button
                loading={this.props.saving}
                text={this.props.connectorInstance ? 'Save' : 'Create'}
                type="large"
                submit={true}
                onClick={this.props.updateSettings} />
            </form>
          </C.Column>
        </C.Panel>
      </C.Page>
    );
  }
}

export default EditForm;
global.EditForm = EditForm;
