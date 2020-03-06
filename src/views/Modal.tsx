import {Component, ComponentChildren, h, render} from 'preact';
import {createPortal} from 'preact/compat';
import './Modal.scss';

interface IProps
{
	onClose?: () => any;
	children?: ComponentChildren;
	show?: boolean;
}

interface IState
{
	active: boolean;
}

export default class Modal extends Component<IProps, IState>
{
	private readonly container: HTMLDivElement;
	private rendered: boolean = false;

	state: IState = {
		active: false,
	};

	constructor(props, context)
	{
		super(props, context);
		this.state.active = !!props.show;
		this.container = document.createElement('div');
		document.body.appendChild(this.container);
	}

	componentWillUnmount(): void
	{
	}

	componentWillReceiveProps(nextProps: Readonly<IProps>, nextContext: any): void
	{
		if (typeof nextProps.show === 'boolean') {
			this.setState({active: nextProps.show});
		}
	}

	componentDidMount(): void
	{
		this.rendered = true;
	}

	toggle(state?: boolean)
	{
		this.setState({
			active: state === undefined
				? !this.state.active
				: state
		});
		if (this.rendered && !this.state.active) {
			this.props.onClose && this.props.onClose();
			render(null, this.container, this as Element);
		}
	}

	show()
	{
		this.toggle(true);
	}

	hide()
	{
		this.toggle(false);
	}

	render()
	{
		return createPortal(
			<div className={'modal ' + (this.state.active ? 'active' : '')}>
				<div className="fade" />
				<div className="content">
					<button className="close" onClick={this.hide.bind(this)}>
						&times;
					</button>
					{this.props.children}
				</div>
			</div>,
			this.container
		);
	}
}