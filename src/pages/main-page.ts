import { EventData, Frame, Page } from '@nativescript/core';
import { MainViewModel } from '../view-models/main-view-model';

export class MainPage extends Page {
    private viewModel: MainViewModel;

    constructor() {
        super();
        this.viewModel = new MainViewModel();
        this.bindingContext = this.viewModel;
    }

    onNavigatingTo(args: EventData) {
        super.onNavigatingTo(args);
    }
}