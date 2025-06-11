import { Observable } from '@nativescript/core';

export class MainViewModel extends Observable {
    private _selectedTab: number = 0;
    private _nearbyUsers: any[] = [];
    private _posts: any[] = [];
    private _currentUser: any;

    constructor() {
        super();
        this.initializeData();
    }

    get selectedTab(): number {
        return this._selectedTab;
    }

    set selectedTab(value: number) {
        if (this._selectedTab !== value) {
            this._selectedTab = value;
            this.notifyPropertyChange('selectedTab', value);
        }
    }

    get nearbyUsers(): any[] {
        return this._nearbyUsers;
    }

    get posts(): any[] {
        return this._posts;
    }

    get currentUser(): any {
        return this._currentUser;
    }

    private initializeData() {
        // Synthetic data for nearby users
        this._nearbyUsers = [
            {
                name: "John Doe",
                dp_url: "https://i.pravatar.cc/150?u=john",
                bio: "Tech enthusiast",
                links: {
                    Twitter: "twitter.com/john",
                    Instagram: "instagram.com/john",
                    LinkedIn: "linkedin.com/in/john"
                }
            },
            {
                name: "Jane Smith",
                dp_url: "https://i.pravatar.cc/150?u=jane",
                bio: "Food blogger",
                links: {
                    Twitter: "twitter.com/jane",
                    Instagram: "instagram.com/jane",
                    LinkedIn: "linkedin.com/in/jane"
                }
            }
        ];

        // Synthetic data for posts
        this._posts = [
            {
                title: "Beautiful Sunset",
                media_url: "https://picsum.photos/400/300?random=1",
                caption: "Amazing evening views!"
            },
            {
                title: "Morning Coffee",
                media_url: "https://picsum.photos/400/300?random=2",
                caption: "Perfect start to the day"
            }
        ];

        // Current user data
        this._currentUser = {
            name: "Alex Johnson",
            dp_url: "https://i.pravatar.cc/150?u=alex",
            bio: "Living life to the fullest",
            poster_url: "https://picsum.photos/800/200?random=3",
            media: [
                { media_url: "https://picsum.photos/200/200?random=4" },
                { media_url: "https://picsum.photos/200/200?random=5" },
                { media_url: "https://picsum.photos/200/200?random=6" }
            ]
        };
    }

    onMessageTap() {
        alert("Messaging will be available in future updates");
    }
}