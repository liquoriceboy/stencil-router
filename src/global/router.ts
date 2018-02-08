import { ActiveRouter, Listener, RouterGroup, MatchResults } from './interfaces';

declare var Context: any;

Context.activeRouter = (function() {
  let state: { [key: string]: any } = {};
  let groups: { [key: string]: RouterGroup } = {};
  let activeGroupId: number = 0;
  const nextListeners: Function[] = [];

  function getDefaultState() {
    return {
      location: {
        pathname: Context.window.location.pathname,
        search: Context.window.location.search
      }
    };
  }

  function set(value: { [key: string]: any }) {
    state = {
      ...state,
      ...value
    };
    dispatch();
  }

  function get(attrName?: string) {
    if (Object.keys(state).length === 0) {
      return getDefaultState();
    }
    if (!attrName) {
      return state;
    }
    return state[attrName];
  }

  function dispatch() {
    const listeners = nextListeners;
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }


  function createGroup() {
    activeGroupId += 1;
    groups[activeGroupId] = [];
    function groupedListener() {
      groups[activeGroupId].listenerList.some(listener => listener() !== null)
    }

    nextListeners.push(groups[])
    return activeGroupId;
  }

  function addGroupListener(listener: () => null | MatchResults, groupName?: string, groupIndex?: number) {
    groups[groupName].listenerList[groupIndex] = listener;
  }

  function removeGroupListener(groupName: string, groupIndex: number) {
    groups[groupName].listenerList.splice(groupIndex, 1);
    if (groups[groupName].listenerList.length === 0) {
      delete groups[groupName];
    }
  }


  function subscribe(listener: () => null | MatchResults, groupName?: string, groupIndex?: number): Listener {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    if (groupName) {
      addGroupListener(listener, groupName, groupIndex);
    } else {
      nextListeners.push(listener);
    }

    let isSubscribed = true;

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (groupName) {
        removeGroupListener(groupName, groupIndex);
      } else {
        const index = nextListeners.indexOf(listener);
        nextListeners.splice(index, 1);
      }

      isSubscribed = false;
    };
  }

  return {
    set,
    get,
    subscribe,
    createGroup,
  } as ActiveRouter;
})();
