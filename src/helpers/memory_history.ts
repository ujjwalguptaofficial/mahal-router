const popStateEvent = new window.CustomEvent("popstate");
export class MemoryHistory {

    private historyStack_: Array<{ data: any, url: string }> = [];
    private state_: any;
    activeIndex_ = -1;
    get length() {
        return this.historyStack_.length;
    }

    scrollRestoration: ScrollRestoration;
    get state() {
        return this.state_;
    }

    back() {
        --this.activeIndex_;
        window.dispatchEvent(popStateEvent);

    }
    forward() {
        ++this.activeIndex_;
        window.dispatchEvent(popStateEvent);
    }

    go(delta?: number) {
        this.activeIndex_ += delta || 0;
    }

    pushState(data: any, unused: string, url?: string | URL | null) {
        this.historyStack_.push({
            data: data,
            url: url ? url.toString() : ''
        });
        ++this.activeIndex_;
    }

    replaceState(data: any, unused: string, url?: string | URL | null) {
        this.historyStack_[this.activeIndex_] = {
            data: data,
            url: url ? url.toString() : ''
        };
    }
}