import {h} from 'preact';
import {Component} from 'preact/compat';
import Panel from './bookmarks/Panel';

interface IProps
{
}

export default class Main extends Component<IProps, any>
{
	render()
	{
		return <div>
			<Panel />
		</div>;
	}
}