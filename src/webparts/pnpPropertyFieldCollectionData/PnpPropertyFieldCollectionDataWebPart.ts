import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'PnpPropertyFieldCollectionDataWebPartStrings';
import PnpPropertyFieldCollectionData from './components/PnpPropertyFieldCollectionData';
import { IPnpPropertyFieldCollectionDataProps } from './components/IPnpPropertyFieldCollectionDataProps';
import { PropertyFieldCollectionData, CustomCollectionFieldType } from '@pnp/spfx-property-controls/lib/PropertyFieldCollectionData';

export interface IPnpPropertyFieldCollectionDataWebPartProps {
  description: string;
  collectionData: any[];  
} 

export default class PnpPropertyFieldCollectionDataWebPart extends BaseClientSideWebPart<IPnpPropertyFieldCollectionDataWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IPnpPropertyFieldCollectionDataProps> = React.createElement(
      PnpPropertyFieldCollectionData,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        collectionData: this.properties.collectionData  
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyFieldCollectionData("collectionData", {  
                  key: "collectionData",  
                  label: "Collection data",  
                  panelHeader: "Collection data panel header",  
                  manageBtnLabel: "Manage collection data",  
                  value: this.properties.collectionData,  
                  fields: [  
                      {  
                          id: "Title",  
                          title: "Firstname",  
                          type: CustomCollectionFieldType.string,  
                          required: true  
                      },  
                      {  
                          id: "Lastname",  
                          title: "Lastname",  
                          type: CustomCollectionFieldType.string  
                      },  
                      {  
                          id: "Age",  
                          title: "Age",  
                          type: CustomCollectionFieldType.number,  
                          required: true  
                      },  
                      {  
                          id: "City",  
                          title: "Favorite city",  
                          type: CustomCollectionFieldType.dropdown,  
                          options: [  
                              {  
                                  key: "pune",  
                                  text: "Pune"  
                              },  
                              {  
                                  key: "junagadh",  
                                  text: "Junagadh"  
                              }  
                          ],  
                          required: true  
                      }  
                  ],  
                  disabled: false  
              })                 
              ]
            }
          ]
        }
      ]
    };
  }
}
